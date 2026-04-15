import json
import os
import psycopg2
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
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
LOGO_URL = 'https://cdn.poehali.dev/projects/bd9048a7-854b-4d3b-a782-386c5097cafc/bucket/ff23bd6f-4714-405e-a0e1-1a2113cb8aa6.jpg'
COMPANY_NAME = 'Техно-Сиб'
MANAGER_PHONE = '8-800-505-76-84'
MANAGER_EMAIL = 'volchki@t-sib.ru'


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


def download_image_bytes(url):
    """Скачиваем картинку и возвращаем байты"""
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        return urlopen(req, timeout=10).read()
    except Exception:
        return None


def make_image(url, max_width, max_height):
    """Скачиваем картинку и возвращаем ReportLab Image"""
    data = download_image_bytes(url)
    if not data:
        return None
    buf = BytesIO(data)
    img = Image(buf, width=max_width, height=max_height)
    img.hAlign = 'CENTER'
    return img


def strip_html(text):
    if not text:
        return ''
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean


def download_font(url, filename):
    import tempfile
    font_path = os.path.join(tempfile.gettempdir(), filename)
    if os.path.exists(font_path):
        return font_path
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    data = urlopen(req, timeout=15).read()
    with open(font_path, 'wb') as f:
        f.write(data)
    return font_path


_fonts_registered = False
_font_regular = 'Helvetica'
_font_bold = 'Helvetica-Bold'


def register_fonts():
    global _fonts_registered, _font_regular, _font_bold
    if _fonts_registered:
        return _font_regular, _font_bold

    dejavu_paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ]

    if os.path.exists(dejavu_paths[0]):
        pdfmetrics.registerFont(TTFont('CyrFont', dejavu_paths[0]))
        pdfmetrics.registerFont(TTFont('CyrFont-Bold', dejavu_paths[1]))
        _font_regular = 'CyrFont'
        _font_bold = 'CyrFont-Bold'
        _fonts_registered = True
        return _font_regular, _font_bold

    try:
        regular_path = download_font(
            'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/opensans/OpenSans%5Bwdth%2Cwght%5D.ttf',
            'OpenSans-Regular.ttf'
        )
        pdfmetrics.registerFont(TTFont('CyrFont', regular_path))
        pdfmetrics.registerFont(TTFont('CyrFont-Bold', regular_path))
        _font_regular = 'CyrFont'
        _font_bold = 'CyrFont-Bold'
        _fonts_registered = True
        return _font_regular, _font_bold
    except Exception as e:
        print(f'Font error: {e}')
        return 'Helvetica', 'Helvetica-Bold'


def _header_footer(canvas, doc, logo_img_data, font_regular, font_bold, category_name):
    """Колонтитул: логотип + контакты сверху на каждой странице"""
    canvas.saveState()
    page_width, page_height = A4

    canvas.setFillColor(DARK_COLOR)
    canvas.rect(0, page_height - 22*mm, page_width, 22*mm, fill=1, stroke=0)

    if logo_img_data:
        try:
            logo_buf = BytesIO(logo_img_data)
            canvas.drawImage(
                logo_buf, 12*mm, page_height - 18*mm,
                width=30*mm, height=14*mm,
                preserveAspectRatio=True, mask='auto'
            )
        except Exception:
            canvas.setFillColor(colors.white)
            canvas.setFont(font_bold, 14)
            canvas.drawString(12*mm, page_height - 15*mm, COMPANY_NAME)
    else:
        canvas.setFillColor(colors.white)
        canvas.setFont(font_bold, 14)
        canvas.drawString(12*mm, page_height - 15*mm, COMPANY_NAME)

    canvas.setFillColor(colors.white)
    canvas.setFont(font_regular, 9)
    canvas.drawRightString(page_width - 12*mm, page_height - 11*mm, MANAGER_PHONE)
    canvas.drawRightString(page_width - 12*mm, page_height - 17*mm, MANAGER_EMAIL)

    canvas.setFillColor(GRAY_COLOR)
    canvas.setFont(font_regular, 7)
    canvas.drawCentredString(page_width / 2, 10*mm, f'{COMPANY_NAME} | {MANAGER_PHONE} | {MANAGER_EMAIL}')
    canvas.drawRightString(page_width - 12*mm, 10*mm, f'{canvas.getPageNumber()}')

    canvas.restoreState()


def build_pdf(products, category_name):
    """Генерируем PDF-каталог"""
    font_regular, font_bold = register_fonts()

    logo_data = download_image_bytes(LOGO_URL)

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=28*mm,
        bottomMargin=18*mm,
        leftMargin=15*mm,
        rightMargin=15*mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontName=font_bold, fontSize=20,
        textColor=DARK_COLOR, spaceAfter=4*mm,
        alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontName=font_regular, fontSize=11,
        textColor=GRAY_COLOR, alignment=TA_CENTER,
        spaceAfter=8*mm
    )
    product_name_style = ParagraphStyle(
        'ProductName', parent=styles['Normal'],
        fontName=font_bold, fontSize=13,
        textColor=DARK_COLOR, spaceAfter=2*mm
    )
    price_style = ParagraphStyle(
        'Price', parent=styles['Normal'],
        fontName=font_bold, fontSize=12,
        textColor=ACCENT_COLOR, spaceAfter=3*mm
    )
    param_name_style = ParagraphStyle(
        'ParamName', parent=styles['Normal'],
        fontName=font_regular, fontSize=8,
        textColor=GRAY_COLOR
    )
    param_value_style = ParagraphStyle(
        'ParamValue', parent=styles['Normal'],
        fontName=font_bold, fontSize=8,
        textColor=DARK_COLOR
    )
    desc_style = ParagraphStyle(
        'Desc', parent=styles['Normal'],
        fontName=font_regular, fontSize=8,
        textColor=DARK_COLOR, leading=12,
        spaceAfter=4*mm
    )
    section_style = ParagraphStyle(
        'Section', parent=styles['Normal'],
        fontName=font_bold, fontSize=10,
        textColor=ACCENT_COLOR, spaceAfter=2*mm, spaceBefore=3*mm
    )
    manager_style = ParagraphStyle(
        'Manager', parent=styles['Normal'],
        fontName=font_regular, fontSize=10,
        textColor=DARK_COLOR, alignment=TA_CENTER
    )
    manager_bold_style = ParagraphStyle(
        'ManagerBold', parent=styles['Normal'],
        fontName=font_bold, fontSize=12,
        textColor=DARK_COLOR, alignment=TA_CENTER
    )

    elements = []

    elements.append(Paragraph(f'Каталог: {category_name}', title_style))
    elements.append(Paragraph(f'{len(products)} позиций', subtitle_style))

    for i, product in enumerate(products):
        if i > 0:
            elements.append(PageBreak())

        elements.append(Paragraph(product.get('name', 'Без названия'), product_name_style))

        price = product.get('price')
        if price and price > 0:
            elements.append(Paragraph(
                f'от {int(price):,} руб.'.replace(',', ' '),
                price_style
            ))

        img_url = product.get('picture', '')
        if product.get('additional_images'):
            img_url = product['additional_images'][0]
        if img_url:
            img = make_image(img_url, 150, 110)
            if img:
                elements.append(img)
                elements.append(Spacer(1, 3*mm))

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
                    Paragraph(str(value), param_value_style)
                ])

            if table_data:
                col_widths = [90*mm, 85*mm]
                t = Table(table_data, colWidths=col_widths)
                t.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 1),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
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

            if len(desc) > 500:
                desc = desc[:500] + '...'
            elements.append(Paragraph('Описание', section_style))
            elements.append(Paragraph(desc, desc_style))

    elements.append(Spacer(1, 12*mm))
    elements.append(Paragraph('—' * 40, manager_style))
    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph('Менеджер по продажам', manager_bold_style))
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(MANAGER_PHONE, manager_style))
    elements.append(Paragraph(MANAGER_EMAIL, manager_style))
    elements.append(Spacer(1, 3*mm))
    elements.append(Paragraph(
        f'{COMPANY_NAME} — промышленное мясоперерабатывающее оборудование',
        ParagraphStyle('FooterNote', parent=styles['Normal'],
                       fontName=font_regular, fontSize=8,
                       textColor=GRAY_COLOR, alignment=TA_CENTER)
    ))

    on_page = lambda canvas, doc: _header_footer(canvas, doc, logo_data, font_regular, font_bold, category_name)
    doc.build(elements, onFirstPage=on_page, onLaterPages=on_page)
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
    limit_str = params.get('limit', '0')
    limit = int(limit_str) if limit_str != '0' else 0

    category_map = {
        'wolves': (221, 'Промышленные волчки'),
        'cutters': (226, 'Куттеры'),
        'blockcutters': (220, 'Блокорезки'),
    }

    cat_id, cat_name = category_map.get(category, (221, 'Промышленные волчки'))

    products = load_products()
    filtered = [p for p in products if p.get('category_id') == cat_id]
    filtered = [p for p in filtered if p.get('params') and len(p['params']) > 0]
    filtered.sort(key=lambda p: (0 if p.get('price') and p['price'] > 0 else 1, p.get('price') or 999999999))

    if limit > 0:
        filtered = filtered[:limit]

    if not filtered:
        return {
            'statusCode': 404,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Товары не найдены'})
        }

    pdf_bytes = build_pdf(filtered, cat_name)

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    import hashlib, time
    hash_suffix = hashlib.md5(str(time.time()).encode()).hexdigest()[:8]
    filename = f'catalog_{category}_{len(filtered)}_{hash_suffix}.pdf'
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
            'products_count': len(filtered)
        })
    }
