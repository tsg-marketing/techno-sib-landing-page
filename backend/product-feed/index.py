import json
import os
import re
import psycopg2
from datetime import datetime


TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '/': '-', '.': '-', ',': '', '"': '', "'": '',
    '(': '', ')': '', '«': '', '»': '', '№': 'n'
}

CATEGORY_URL_MAP = {
    221: 'https://volchki.t-sib.ru/',
    226: 'https://volchki.t-sib.ru/cutter',
    220: 'https://volchki.t-sib.ru/blokorezka',
}

CATEGORY_NAMES = {
    221: 'Промышленные волчки (мясорубки)',
    226: 'Куттеры',
    220: 'Блокорезки',
}


def generate_slug(name):
    slug = ''
    for c in name.lower():
        if c in TRANSLIT_MAP:
            slug += TRANSLIT_MAP[c]
        else:
            slug += c
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug[:80]


def get_product_url(category_id, name):
    base = CATEGORY_URL_MAP.get(category_id, 'https://volchki.t-sib.ru/')
    slug = generate_slug(name)
    return base + '#' + slug


def get_db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_products():
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT products_json FROM catalog_cache ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        if row and row[0]:
            data = json.loads(row[0])
            return data.get('products', [])
        return []
    finally:
        conn.close()


def build_xml_feed(products):
    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append('<yml_catalog date="' + datetime.utcnow().strftime('%Y-%m-%d %H:%M') + '">')
    lines.append('  <shop>')
    lines.append('    <name>Техно-Сиб - промышленное мясоперерабатывающее оборудование</name>')
    lines.append('    <company>Техно-Сиб</company>')
    lines.append('    <url>https://volchki.t-sib.ru</url>')
    lines.append('    <currencies>')
    lines.append('      <currency id="RUR" rate="1"/>')
    lines.append('    </currencies>')
    lines.append('    <categories>')
    for cat_id, cat_name in CATEGORY_NAMES.items():
        lines.append('      <category id="' + str(cat_id) + '">' + escape_xml(cat_name) + '</category>')
    lines.append('    </categories>')
    lines.append('    <offers>')

    for product in products:
        cat_id = product.get('category_id')
        if cat_id not in CATEGORY_URL_MAP:
            continue

        name = product.get('name', '')
        if not name:
            continue

        offer_id = product.get('id', '')
        url = get_product_url(cat_id, name)
        price = product.get('price')
        picture = product.get('picture', '')
        description = product.get('description', '')

        available = 'true' if price and price > 0 else 'false'
        lines.append('      <offer id="' + escape_xml(str(offer_id)) + '" available="' + available + '">')
        lines.append('        <url>' + escape_xml(url) + '</url>')
        lines.append('        <name>' + escape_xml(name) + '</name>')

        if price and price > 0:
            lines.append('        <price>' + str(int(price)) + '</price>')

        lines.append('        <currencyId>RUR</currencyId>')
        lines.append('        <categoryId>' + str(cat_id) + '</categoryId>')

        if picture:
            lines.append('        <picture>' + escape_xml(picture) + '</picture>')

        additional_images = product.get('additional_images', [])
        for img in additional_images[:9]:
            lines.append('        <picture>' + escape_xml(img) + '</picture>')

        if description:
            clean_desc = re.sub(r'<[^>]+>', '', description)[:3000]
            lines.append('        <description>' + escape_xml(clean_desc) + '</description>')

        params = product.get('params', [])
        for param in params:
            p_name = param.get('name', '')
            p_value = param.get('value', '')
            p_unit = param.get('unit', '')
            if p_name and p_value:
                unit_attr = ' unit="' + escape_xml(p_unit) + '"' if p_unit else ''
                lines.append('        <param name="' + escape_xml(p_name) + '"' + unit_attr + '>' + escape_xml(str(p_value)) + '</param>')

        lines.append('      </offer>')

    lines.append('    </offers>')
    lines.append('  </shop>')
    lines.append('</yml_catalog>')
    return '\n'.join(lines)


def escape_xml(text):
    if not text:
        return ''
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&apos;'))


def handler(event, context):
    """Генерация товарного фида (YML) с якорными ссылками на volchki.t-sib.ru"""

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
    fmt = query_params.get('format', 'xml')

    products = load_products()

    if fmt == 'json':
        items = []
        for p in products:
            cat_id = p.get('category_id')
            name = p.get('name', '')
            if cat_id not in CATEGORY_URL_MAP or not name:
                continue
            items.append({
                'id': p.get('id'),
                'name': name,
                'slug': generate_slug(name),
                'url': get_product_url(cat_id, name),
                'price': p.get('price'),
                'category_id': cat_id,
                'category_name': CATEGORY_NAMES.get(cat_id, ''),
                'picture': p.get('picture', ''),
            })

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'products': items, 'total': len(items)}, ensure_ascii=False)
        }

    xml_body = build_xml_feed(products)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/xml; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        },
        'body': xml_body
    }
