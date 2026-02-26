import json
import xml.etree.ElementTree as ET
from urllib.request import urlopen
from datetime import datetime, timedelta
import os
import psycopg2

CACHE_TTL_HOURS = 24


def get_db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_from_db():
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT products_json, total, updated_at FROM catalog_cache ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        if row:
            return row[0], row[1], row[2]
        return None, 0, None
    finally:
        conn.close()


def save_to_db(products_json, total):
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM catalog_cache")
        escaped = products_json.replace("'", "''")
        cur.execute(
            "INSERT INTO catalog_cache (products_json, total, updated_at) VALUES ('" + escaped + "', " + str(total) + ", NOW())"
        )
        conn.commit()
    finally:
        conn.close()


def parse_feed():
    xml_url = 'https://t-sib.ru/upload/catalog.xml'
    with urlopen(xml_url, timeout=15) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    shop = root.find('shop')
    if shop is None:
        raise ValueError('Invalid XML structure: no <shop> element')

    categories = {}
    for category in shop.findall('.//category'):
        cat_id_str = category.get('id')
        if cat_id_str:
            try:
                categories[int(cat_id_str)] = category.text
            except (ValueError, TypeError):
                pass

    products = []
    target_categories = [220, 221, 226]
    total_images_found = 0

    for offer in shop.findall('.//offer'):
        offer_id = offer.get('id')
        category_id_elem = offer.find('categoryId')
        if category_id_elem is None or not category_id_elem.text:
            continue
        try:
            category_id = int(category_id_elem.text)
        except (ValueError, TypeError):
            continue
        if category_id not in target_categories:
            continue

        name = offer.find('name')
        price = offer.find('price')
        picture = offer.find('picture')
        description = offer.find('description')

        params = []
        params_preview = []
        params_full = []
        additional_images = []
        all_param_names = [p.get('name') for p in offer.findall('param')]

        for param in offer.findall('param'):
            param_name = param.get('name')
            param_value = param.text
            param_unit = param.get('unit', '')

            if param_name == 'Картинки товара' and param_value:
                img_url = param_value.strip()
                if img_url:
                    if img_url.startswith('/'):
                        img_url = 'https://t-sib.ru' + img_url
                    additional_images.append(img_url)
                    total_images_found += 1
                continue

            if param_name == 'Видео (ссылка)':
                continue

            param_obj = {'name': param_name, 'value': param_value, 'unit': param_unit}
            params.append(param_obj)
            params_full.append(param_obj)
            if len(params_preview) < 5:
                params_preview.append(param_obj)

        price_value = None
        if price is not None and price.text:
            price_text = price.text.strip()
            price_text = price_text.replace('от', '').replace('руб.', '').replace('руб', '').replace(' ', '').strip()
            try:
                price_value = float(price_text)
            except ValueError:
                price_value = None

        if price_value is not None and price_value < 300000:
            continue
        if len(params) == 0:
            continue

        products.append({
            'id': offer_id,
            'category_id': category_id,
            'category_name': categories.get(category_id, ''),
            'name': name.text if name is not None else '',
            'price': price_value,
            'picture': picture.text if picture is not None else '',
            'additional_images': additional_images,
            'description': description.text if description is not None else '',
            'params': params,
            'params_preview': params_preview[:5],
            'params_full': params_full,
            'debug_all_params': all_param_names[:10]
        })

    return products, total_images_found


def handler(event, context):
    """Парсер XML-фида товаров с кэшированием в БД (обновление раз в сутки)"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    query_params = event.get('queryStringParameters') or {}
    force_refresh = query_params.get('refresh') == 'true'

    cached_json, cached_total, cached_at = load_from_db()

    if not force_refresh and cached_json and cached_at:
        age = datetime.utcnow() - cached_at.replace(tzinfo=None)
        if age < timedelta(hours=CACHE_TTL_HOURS):
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Cache': 'HIT',
                    'X-Cache-Age': str(int(age.total_seconds()))
                },
                'body': cached_json
            }

    try:
        products, total_images_found = parse_feed()
    except Exception as e:
        if cached_json:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Cache': 'STALE'
                },
                'body': cached_json
            }
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'message': 'Failed to parse XML feed'})
        }

    products_with_images = [p for p in products if p['additional_images']]
    response_body = json.dumps({
        'products': products,
        'total': len(products),
        'total_images_found': total_images_found,
        'products_with_images': len(products_with_images),
        'updated_at': datetime.utcnow().isoformat()
    }, ensure_ascii=False)

    save_to_db(response_body, len(products))

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'MISS'
        },
        'body': response_body
    }