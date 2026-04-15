import json
import os
import base64
import psycopg2
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from urllib.request import urlopen, Request
import re
import boto3


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

ACCENT_COLOR = HexColor('#E87A2E')
DARK_COLOR = HexColor('#1A1A2E')
GRAY_COLOR = HexColor('#666666')
LIGHT_BG = HexColor('#F5F5F5')


def get_db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_products():
    """Загружаем товары из кэша БД"""
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT products_json FROM catalog_cache ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        if row and row[0]:
            data = row[0]
            if isinstance(data, str):
                data = json.loads(data)
            if isinstance(data, dict):
                return data.get('products', data.get('items', []))
            if isinstance(data, list):
                return data
        return []
    finally:
        conn.close()


def download_image(url, max_width=160, max_height=120):
    """Скачиваем картинку и возвращаем ReportLab Image"""
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urlopen(req, timeout=10).read()
        buf = BytesIO(data)
        img = Image(buf, width=max_width, height=max_height)
        img.hAlign = 'CENTER'
        return img
    except Exception:
        return None


def strip_html(text):
    """Убираем HTML-теги"""
    if not text:
        return ''
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean


def register_fonts():
    """Регистрируем шрифты с поддержкой кириллицы"""
    try:
        pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
        pdfmetrics.registerFont(TTFont('DejaVu-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
        return 'DejaVu', 'DejaVu-Bold'
    except Exception:
        return 'Helvetica', 'Helvetica-Bold'


def build_pdf(products, category_name, manager_name, manager_phone, manager_email):
    """Генерируем PDF-каталог"""
    font_regular, font_bold = register_fonts()

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=20*mm,
        bottomMargin=20*mm,
        leftMargin=15*mm,
        rightMargin=15*mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontName=font_bold, fontSize=22,
        textColor=DARK_COLOR, spaceAfter=6*mm,
        alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontName=font_regular, fontSize=11,
        textColor=GRAY_COLOR, alignment=TA_CENTER,
        spaceAfter=10*mm
    )
    product_name_style = ParagraphStyle(
        'ProductName', parent=styles['Normal'],
        fontName=font_bold, fontSize=14,
        textColor=DARK_COLOR, spaceAfter=3*mm
    )
    price_style = ParagraphStyle(
        'Price', parent=styles['Normal'],
        fontName=font_bold, fontSize=13,
        textColor=ACCENT_COLOR, spaceAfter=3*mm
    )
    param_name_style = ParagraphStyle(
        'ParamName', parent=styles['Normal'],
        fontName=font_regular, fontSize=9,
        textColor=GRAY_COLOR
    )
    param_value_style = ParagraphStyle(
        'ParamValue', parent=styles['Normal'],
        fontName=font_bold, fontSize=9,
        textColor=DARK_COLOR
    )
    desc_style = ParagraphStyle(
        'Desc', parent=styles['Normal'],
        fontName=font_regular, fontSize=9,
        textColor=DARK_COLOR, leading=13,
        spaceAfter=4*mm
    )
    manager_style = ParagraphStyle(
        'Manager', parent=styles['Normal'],
        fontName=font_regular, fontSize=10,
        textColor=DARK_COLOR, alignment=TA_CENTER
    )
    manager_bold_style = ParagraphStyle(
        'ManagerBold', parent=styles['Normal'],
        fontName=font_bold, fontSize=11,
        textColor=DARK_COLOR, alignment=TA_CENTER
    )
    section_style = ParagraphStyle(
        'Section', parent=styles['Normal'],
        fontName=font_bold, fontSize=10,
        textColor=ACCENT_COLOR, spaceAfter=2*mm, spaceBefore=3*mm
    )

    elements = []

    elements.append(Paragraph('ТехСиб', title_style))
    elements.append(Paragraph(f'Каталог: {category_name}', subtitle_style))

    for i, product in enumerate(products):
        if i > 0:
            elements.append(PageBreak())

        elements.append(Paragraph(product.get('name', 'Без названия'), product_name_style))

        price = product.get('price')
        if price and price > 0:
            elements.append(Paragraph(
                f'от {int(price):,} ₽'.replace(',', ' '),
                price_style
            ))

        img_url = product.get('picture', '')
        if product.get('additional_images'):
            img_url = product['additional_images'][0]
        if img_url:
            img = download_image(img_url)
            if img:
                elements.append(img)
                elements.append(Spacer(1, 4*mm))

        params = product.get('params_full') or product.get('params') or []
        visible_params = [p for p in params if p.get('name', '').lower() != 'guid']

        if visible_params:
            elements.append(Paragraph('Характеристики', section_style))
            table_data = []
            for p in visible_params:
                name = p.get('name', '')
                value = p.get('value', '')
                unit = p.get('unit', '')
                if unit:
                    value = f'{value} {unit}'
                table_data.append([
                    Paragraph(name, param_name_style),
                    Paragraph(value, param_value_style)
                ])

            if table_data:
                col_widths = [90*mm, 85*mm]
                t = Table(table_data, colWidths=col_widths)
                t.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                    ('LINEBELOW', (0, 0), (-1, -1), 0.5, HexColor('#EEEEEE')),
                ]))
                elements.append(t)

        desc = strip_html(product.get('description', ''))
        if desc:
            name = product.get('name', '')
            first_line = desc.split('.')[0] if desc else ''
            if name and name.lower()[:20] in first_line.lower():
                parts = desc.split('.', 1)
                desc = parts[1].strip() if len(parts) > 1 else desc

            if len(desc) > 600:
                desc = desc[:600] + '...'
            elements.append(Paragraph('Описание', section_style))
            elements.append(Paragraph(desc, desc_style))

    elements.append(Spacer(1, 15*mm))
    elements.append(Paragraph('—' * 40, manager_style))
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph(manager_name, manager_bold_style))
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(f'☎ {manager_phone}', manager_style))
    elements.append(Paragraph(f'✉ {manager_email}', manager_style))
    elements.append(Spacer(1, 3*mm))
    elements.append(Paragraph('ТехСиб — промышленное мясоперерабатывающее оборудование', ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontName=font_regular, fontSize=8,
        textColor=GRAY_COLOR, alignment=TA_CENTER
    )))

    doc.build(elements)
    return buf.getvalue()


def handler(event, context):
    """Генерация PDF-каталога с товарами по категории"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Access-Control-Max-Age': '86400'},
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    category = params.get('category', 'wolves')
    limit = int(params.get('limit', '5'))

    category_map = {
        'wolves': (221, 'Промышленные волчки'),
        'cutters': (226, 'Куттеры'),
        'blockcutters': (220, 'Блокорезки'),
    }

    cat_id, cat_name = category_map.get(category, (221, 'Промышленные волчки'))

    products = load_products()
    filtered = [p for p in products if p.get('category_id') == cat_id]
    filtered.sort(key=lambda p: (0 if p.get('price') and p['price'] > 0 else 1, p.get('price') or 999999999))
    selected = filtered[:limit]

    if not selected:
        return {
            'statusCode': 404,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Товары не найдены'})
        }

    pdf_bytes = build_pdf(
        selected,
        cat_name,
        manager_name='Менеджер по продажам',
        manager_phone='8-800-505-76-84',
        manager_email='volchki@t-sib.ru'
    )

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    filename = f'catalog_{category}_{limit}.pdf'
    s3_key = f'pdf/{filename}'

    s3.put_object(
        Bucket='files',
        Key=s3_key,
        Body=pdf_bytes,
        ContentType='application/pdf'
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    return {
        'statusCode': 200,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'url': cdn_url,
            'filename': filename,
            'products_count': len(selected)
        })
    }