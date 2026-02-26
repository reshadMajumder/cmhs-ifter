"""
Pillow-based ticket image generator.
Recreates the HTML ticket design as a PNG image – pixel-perfect match.
"""
import io
import os
import hashlib
import tempfile
import requests
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from django.conf import settings


# ── Colour helpers ──────────────────────────────────────────────────
def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lerp_color(c1, c2, t):
    """Linearly interpolate between two RGB(A) tuples."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(len(c1)))


# ── Efficient gradient builders ─────────────────────────────────────
def _make_diagonal_gradient(w, h, c1, c2, three_stop=False):
    """
    Build a diagonal (135deg) gradient RGBA image FAST:
    render at 1/10 scale then upscale with LANCZOS.
    If three_stop=True  gradient goes c1 -> c2 -> c1.
    """
    sw, sh = max(w // 10, 1), max(h // 10, 1)
    small = Image.new('RGBA', (sw, sh))
    px = small.load()
    for sy in range(sh):
        for sx in range(sw):
            t = (sx / sw + sy / sh) / 2.0
            if three_stop:
                c = lerp_color(c1, c2, t * 2) if t < 0.5 else lerp_color(c2, c1, (t - 0.5) * 2)
            else:
                c = lerp_color(c1, c2, t)
            px[sx, sy] = (*c, 255)
    return small.resize((w, h), Image.LANCZOS)


def _make_vertical_gradient(w, h, stops):
    """
    Build a vertical gradient from a list of (position, r, g, b, a) stops.
    Position is 0.0-1.0.  Drawn with efficient row-level lines.
    """
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        prev = stops[0]
        nxt = stops[-1]
        for i in range(len(stops) - 1):
            if stops[i][0] <= t <= stops[i + 1][0]:
                prev = stops[i]
                nxt = stops[i + 1]
                break
        seg = nxt[0] - prev[0]
        lt = (t - prev[0]) / seg if seg > 0 else 0
        r = int(prev[1] + (nxt[1] - prev[1]) * lt)
        g = int(prev[2] + (nxt[2] - prev[2]) * lt)
        b = int(prev[3] + (nxt[3] - prev[3]) * lt)
        a = int(prev[4] + (nxt[4] - prev[4]) * lt)
        if a > 0:
            draw.line([(0, y), (w - 1, y)], fill=(r, g, b, a))
    return img


def apply_glass_panel(base_img, bbox, radius=12, tint_rgb=(10, 14, 28),
                      tint_strength=0.35, blur_radius=6, opacity=185):
    """Apply a blurred glass-like overlay over bbox to keep background visible."""
    x0, y0, x1, y1 = [int(round(v)) for v in bbox]
    x0 = max(0, x0)
    y0 = max(0, y0)
    x1 = min(base_img.width, x1)
    y1 = min(base_img.height, y1)
    if x1 <= x0 or y1 <= y0:
        return

    panel = base_img.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(blur_radius))
    tint_layer = Image.new('RGBA', panel.size, (*tint_rgb, 255))
    glass = Image.blend(panel, tint_layer, tint_strength)

    mask = Image.new('L', panel.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, panel.size[0] - 1, panel.size[1] - 1),
        radius=radius,
        fill=opacity
    )
    base_img.paste(glass, (x0, y0), mask)


def redraw_footer_layer(target_img, scale, left_text, left_bold_text, right_text,
                        font_size=10, padding=24):
    """Re-render footer text at the scaled resolution for extra sharpness."""
    if scale == 1:
        return

    footer_h = int(round(FOOTER_H * scale))
    footer_y = target_img.height - footer_h
    pad = int(round(padding * scale))

    draw = ImageDraw.Draw(target_img)
    draw.rectangle([(0, footer_y), (target_img.width, target_img.height)], fill=(0, 0, 0, 153))
    line_width = max(1, int(round(scale)))
    draw.line([(0, footer_y), (target_img.width, footer_y)], fill=(255, 255, 255, 25), width=line_width)

    scaled_font_size = max(1, int(round(font_size * scale)))
    font_left = get_font('PTSans-Regular', scaled_font_size)
    font_left_bold = get_font('PTSans-Bold', scaled_font_size)

    flb = draw.textbbox((0, 0), left_text, font=font_left)
    fl_w = flb[2] - flb[0]
    fl_h = flb[3] - flb[1]
    fl_y = footer_y + (footer_h - fl_h) // 2
    draw.text((pad, fl_y), left_text, fill=(255, 255, 255, 255), font=font_left)

    draw.text((pad + fl_w, fl_y), left_bold_text, fill=(255, 255, 255, 255), font=font_left_bold)

    frb = draw.textbbox((0, 0), right_text, font=font_left)
    fr_w = frb[2] - frb[0]
    draw.text(
        (target_img.width - fr_w - pad, fl_y),
        right_text, fill=(255, 255, 255, 255), font=font_left
    )


# ── Font helpers ────────────────────────────────────────────────────
FONT_CACHE_DIR = os.path.join(tempfile.gettempdir(), 'cmhs_ticket_fonts')

GOOGLE_FONT_URLS = {
    'PlayfairDisplay-Bold': 'https://github.com/google/fonts/raw/main/ofl/playfairdisplay/static/PlayfairDisplay-Bold.ttf',
    'PlayfairDisplay-Black': 'https://github.com/google/fonts/raw/main/ofl/playfairdisplay/static/PlayfairDisplay-Black.ttf',
    'PTSans-Regular': 'https://github.com/google/fonts/raw/main/ofl/ptsans/PTSans-Regular.ttf',
    'PTSans-Bold': 'https://github.com/google/fonts/raw/main/ofl/ptsans/PTSans-Bold.ttf',
    'CormorantGaramond-Regular': 'https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf',
    'CormorantGaramond-Italic': 'https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-Italic.ttf',
}


def _download_font(name):
    os.makedirs(FONT_CACHE_DIR, exist_ok=True)
    path = os.path.join(FONT_CACHE_DIR, f'{name}.ttf')
    if os.path.exists(path):
        return path
    url = GOOGLE_FONT_URLS.get(name)
    if not url:
        return None
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        with open(path, 'wb') as f:
            f.write(resp.content)
        return path
    except Exception:
        return None


def get_font(name, size):
    path = _download_font(name)
    if path:
        return ImageFont.truetype(path, size)
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


# ── Image asset helpers ─────────────────────────────────────────────
IMAGE_CACHE_DIR = os.path.join(tempfile.gettempdir(), 'cmhs_ticket_images')

BG_IMAGE_URL = 'https://res.cloudinary.com/dzdf1wu5x/image/upload/v1772005693/Screenshot_2026-02-25_134738_yrcmn0.png'
LANTERN_URL = 'https://res.cloudinary.com/dzdf1wu5x/image/upload/v1771999550/85213-removebg-preview_sgldmm.png'
LOGO_URL = 'https://res.cloudinary.com/dzdf1wu5x/image/upload/v1771998698/Expressive_Graffiti_Logo_for_Ramadan_Iftar-removebg-preview_ixylto.png'


def _download_image(url):
    os.makedirs(IMAGE_CACHE_DIR, exist_ok=True)
    key = hashlib.md5(url.encode()).hexdigest()
    path = os.path.join(IMAGE_CACHE_DIR, f'{key}.png')
    if os.path.exists(path):
        return Image.open(path).copy()
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert('RGBA')
        img.save(path, 'PNG')
        return img
    except Exception:
        return None


# ── QR code generation ──────────────────────────────────────────────
def generate_qr_image(data, size=120):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    return img.resize((size, size), Image.LANCZOS)


# ── Constants matching HTML exactly ─────────────────────────────────
TICKET_W = 900
TICKET_H = 400
LEFT_W = 135         # 15% of 900
RIGHT_W = 180        # 20% of 900
CENTER_W = TICKET_W - LEFT_W - RIGHT_W   # 585
FOOTER_H = 28        # ~py-1.5 + text height
CORNER_R = 16        # border-radius: 16px
OUTPUT_SCALE = 1.35  # upscale factor for crisper exports


def render_ticket_image(ticket):
    """
    Render a ticket as a Pillow Image (RGBA -> RGB PNG bytes).

    Returns:
        bytes - PNG image data
    """
    user = ticket.user
    raw_name = (user.name or 'Guest').strip()
    name_parts = raw_name.split()
    name = ' '.join(name_parts[:2]) if len(name_parts) > 2 else raw_name
    batch = user.batch or 'N/A'
    phone = user.phone or ''
    ticket_code = ticket.ticket_code or ''
    qr_data = str(ticket_code)

    # ── Fonts (sizes match HTML css px exactly) ─────────────────────
    font_title       = get_font('PlayfairDisplay-Black', 60)       # heavier headline weight
    font_subtitle    = get_font('CormorantGaramond-Italic', 30)    # .subtitle-text 30px italic
    font_label       = get_font('PTSans-Regular', 9)               # info labels 9px
    font_name        = get_font('PTSans-Bold', 24)                 # .guest-name 24px
    font_batch       = get_font('PTSans-Bold', 20)                 # .batch-val 20px
    font_contact     = get_font('PTSans-Regular', 14)              # .contact-val 14px
    font_detail_lbl  = get_font('PTSans-Regular', 9)               # detail labels 9px
    font_detail_val  = get_font('PTSans-Bold', 20)                 # .detail-value 20px
    font_footer      = get_font('PTSans-Regular', 10)              # footer larger for readability
    font_footer_bold = get_font('PTSans-Bold', 10)
    font_entry       = get_font('PTSans-Bold', 8)                  # .entry-pass 8px
    font_code_label  = get_font('PTSans-Regular', 8)               # .code-label 7px
    font_code_val    = get_font('PTSans-Regular', 9)               # .code-value 7px mono
    font_scan        = get_font('PTSans-Regular', 9)               # .scan-text 7px

    # ================================================================
    #  LAYER 1 - Base gradient  (#2d1b4e -> #5d3a7a -> #2d1b4e  135deg)
    # ================================================================
    c1 = hex_to_rgb('#2d1b4e')
    c2 = hex_to_rgb('#5d3a7a')
    img = _make_diagonal_gradient(TICKET_W, TICKET_H, c1, c2, three_stop=True)

    # Round the corners by applying an alpha mask
    mask = Image.new('L', (TICKET_W, TICKET_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, TICKET_W - 1, TICKET_H - 1], radius=CORNER_R, fill=255
    )
    img.putalpha(mask)

    draw = ImageDraw.Draw(img)

    # ================================================================
    #  LAYER 2 - Background image overlay at 20% opacity
    # ================================================================
    bg_img = _download_image(BG_IMAGE_URL)
    if bg_img:
        bg_img = bg_img.resize((TICKET_W, TICKET_H), Image.LANCZOS)
        r, g, b, a = bg_img.split()
        a = a.point(lambda p: int(p * 0.20))
        bg_img = Image.merge('RGBA', (r, g, b, a))
        img = Image.alpha_composite(img, bg_img)
        draw = ImageDraw.Draw(img)

    # ================================================================
    #  LAYER 3 - Islamic geometric pattern (diamonds + circles)
    # ================================================================
    pattern = Image.new('RGBA', (TICKET_W, TICKET_H), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pattern)
    cols, rows = 12, 6
    cell_w, cell_h = 80, 80
    for row in range(rows):
        for col in range(cols):
            cx = col * cell_w + 40
            cy = row * cell_h + 40
            s = 20
            # Diamond
            pts = [(cx, cy - s), (cx + s, cy), (cx, cy + s), (cx - s, cy)]
            pdraw.polygon(pts, outline=(255, 255, 255, 20))
            # Small circle inside diamond
            cr = 6
            pdraw.ellipse(
                [cx - cr, cy - cr, cx + cr, cy + cr],
                outline=(255, 255, 255, 13)
            )
    img = Image.alpha_composite(img, pattern)

    # ================================================================
    #  LAYER 4 - Mihrab (arch) decorations  (2 arches, subtle)
    # ================================================================
    arches = Image.new('RGBA', (TICKET_W, TICKET_H), (0, 0, 0, 0))
    adraw = ImageDraw.Draw(arches)
    arch_color_outer = (255, 255, 255, 38)   # 0.15 opacity
    arch_color_inner = (255, 255, 255, 25)   # 0.10 opacity
    for arch_cx in [TICKET_W // 3, 2 * TICKET_W // 3]:
        aw = 100
        ah = int(TICKET_H * 0.90)
        ax0 = arch_cx - aw // 2
        ay0 = TICKET_H - ah
        # Outer arch
        adraw.arc(
            [ax0, ay0, ax0 + aw, ay0 + aw],
            180, 0, fill=arch_color_outer, width=1
        )
        adraw.line([(ax0, ay0 + aw // 2), (ax0, TICKET_H)], fill=arch_color_outer, width=1)
        adraw.line([(ax0 + aw, ay0 + aw // 2), (ax0 + aw, TICKET_H)], fill=arch_color_outer, width=1)
        # Inner arch
        m = 5
        adraw.arc(
            [ax0 + m, ay0 + m, ax0 + aw - m, ay0 + aw - m],
            180, 0, fill=arch_color_inner, width=1
        )
        adraw.line([(ax0 + m, ay0 + (aw - 2 * m) // 2 + m), (ax0 + m, TICKET_H)], fill=arch_color_inner, width=1)
        adraw.line([(ax0 + aw - m, ay0 + (aw - 2 * m) // 2 + m), (ax0 + aw - m, TICKET_H)], fill=arch_color_inner, width=1)
    img = Image.alpha_composite(img, arches)

    # ================================================================
    #  LAYER 5 - Gradient overlays (purple->rose / top-dark / sides)
    # ================================================================
    # Overlay 1: diagonal purple-900/40 -> transparent -> pink-900/30
    sw, sh = max(TICKET_W // 10, 1), max(TICKET_H // 10, 1)
    ov1_sm = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    px1 = ov1_sm.load()
    for sy in range(sh):
        for sx in range(sw):
            t = (sx / sw + sy / sh) / 2.0
            if t < 0.33:
                a = int(0.4 * 255 * (1 - t / 0.33))
                px1[sx, sy] = (88, 28, 135, a)
            elif t > 0.66:
                a = int(0.3 * 255 * ((t - 0.66) / 0.34))
                px1[sx, sy] = (136, 19, 55, a)
    ov1 = ov1_sm.resize((TICKET_W, TICKET_H), Image.LANCZOS)
    img = Image.alpha_composite(img, ov1)

    # Overlay 2: vertical - bottom darker, top slightly dark
    ov2 = _make_vertical_gradient(TICKET_W, TICKET_H, [
        (0.0,  0, 0, 0, 76),    # top: black/30%
        (0.30, 0, 0, 0, 0),     # transparent
        (0.50, 0, 0, 0, 0),     # transparent
        (1.0,  0, 0, 0, 153),   # bottom: black/60%
    ])
    img = Image.alpha_composite(img, ov2)

    # Overlay 3: horizontal edge darkening
    ov3 = Image.new('RGBA', (TICKET_W, TICKET_H), (0, 0, 0, 0))
    ov3d = ImageDraw.Draw(ov3)
    for x in range(TICKET_W):
        t = x / TICKET_W
        if t < 0.15:
            a = int(0.2 * 255 * (1 - t / 0.15))
        elif t > 0.85:
            a = int(0.2 * 255 * ((t - 0.85) / 0.15))
        else:
            a = 0
        if a > 0:
            ov3d.line([(x, 0), (x, TICKET_H - 1)], fill=(0, 0, 0, a))
    img = Image.alpha_composite(img, ov3)

    draw = ImageDraw.Draw(img)

    # ================================================================
    #  LAYER 6 - Lanterns bar at top (height 100px, offset -15px, 50%)
    # ================================================================
    lantern_src = _download_image(LANTERN_URL)
    if lantern_src:
        lw_target, lh_target = 200, 100   # CSS: w-[200px] h-[100px]
        lantern_tile = lantern_src.resize((lw_target, lh_target), Image.LANCZOS)
        r2, g2, b2, a2 = lantern_tile.split()
        a2 = a2.point(lambda p: int(p * 0.5))
        lantern_tile = Image.merge('RGBA', (r2, g2, b2, a2))
        x = 0
        while x < TICKET_W:
            img.paste(lantern_tile, (x, -15), lantern_tile)
            x += lw_target
        draw = ImageDraw.Draw(img)

    # ================================================================
    #  LEFT SECTION - Logo column (bg black/20, border-right)
    # ================================================================
    left_ov = Image.new('RGBA', (LEFT_W, TICKET_H), (0, 0, 0, 51))
    left_crop = img.crop((0, 0, LEFT_W, TICKET_H))
    img.paste(Image.alpha_composite(left_crop, left_ov), (0, 0))
    draw = ImageDraw.Draw(img)
    draw.line([(LEFT_W, 0), (LEFT_W, TICKET_H)], fill=(186, 230, 253, 102), width=1)

    # Logo: gradient circle -> white inner -> logo image
    # HTML: p-2 (8px) rounded-full + Logo h-12 w-12 (48px)
    # Outer gradient circle = 48 + 8*2 = 64px (r=32)
    # White inner circle = 48px (r=24)
    # Image = 48 - 4*2 padding = 40px
    logo_src = _download_image(LOGO_URL)
    lcx, lcy = LEFT_W // 2, TICKET_H // 2
    outer_r = 32   # 64px diameter
    inner_r = 24   # 48px diameter
    logo_sz = 40   # 40px image inside 48px white circle

    for r in range(outer_r, 0, -1):
        t = 1 - (r / outer_r)
        c = lerp_color(hex_to_rgb('#bae6fd'), hex_to_rgb('#93c5fd'), t)
        draw.ellipse([lcx - r, lcy - r, lcx + r, lcy + r], fill=(*c, 255))
    draw.ellipse([lcx - inner_r, lcy - inner_r, lcx + inner_r, lcy + inner_r], fill=(255, 255, 255, 255))

    if logo_src:
        logo_resized = logo_src.resize((logo_sz, logo_sz), Image.LANCZOS)
        lx = lcx - logo_sz // 2
        ly = lcy - logo_sz // 2
        img.paste(logo_resized, (lx, ly), logo_resized)
        draw = ImageDraw.Draw(img)

    # ================================================================
    #  RIGHT SECTION - QR column (bg black/20, border-left)
    # ================================================================
    rx0 = TICKET_W - RIGHT_W
    right_ov = Image.new('RGBA', (RIGHT_W, TICKET_H), (0, 0, 0, 51))
    right_crop = img.crop((rx0, 0, TICKET_W, TICKET_H))
    img.paste(Image.alpha_composite(right_crop, right_ov), (rx0, 0))
    draw = ImageDraw.Draw(img)
    draw.line([(rx0, 0), (rx0, TICKET_H)], fill=(186, 230, 253, 102), width=1)

    # -- Vertically center all right-section content --
    qr_size = 120        # .qr-inner img { width:120px; height:120px }
    qr_padding = 12      # .qr-inner padding: 12px
    qr_outer = qr_size + qr_padding * 2             # 144
    qr_border_pad = 2    # .qr-border padding: 2px
    qr_block = qr_outer + qr_border_pad * 2          # 148

    entry_h = 10
    gap1 = 16
    gap2 = 16
    code_section_h = 30
    gap3 = 10
    scan_h = 10
    total_content = entry_h + gap1 + qr_block + gap2 + code_section_h + gap3 + scan_h
    start_y = (TICKET_H - FOOTER_H - total_content) // 2

    # "ENTRY PASS"
    entry_text = "ENTRY PASS"
    eb = draw.textbbox((0, 0), entry_text, font=font_entry)
    ew = eb[2] - eb[0]
    draw.text(
        (rx0 + (RIGHT_W - ew) // 2, start_y),
        entry_text, fill=(255, 255, 255, 128), font=font_entry
    )

    # QR code block: gradient border -> white bg -> QR image
    qr_y = start_y + entry_h + gap1
    qr_border_img = Image.new('RGBA', (qr_block, qr_block), (0, 0, 0, 0))
    qbd = ImageDraw.Draw(qr_border_img)
    qbd.rounded_rectangle(
        [0, 0, qr_block - 1, qr_block - 1],
        radius=16, fill=(166, 213, 253, 100)
    )
    qbd.rounded_rectangle(
        [qr_border_pad, qr_border_pad,
         qr_block - 1 - qr_border_pad, qr_block - 1 - qr_border_pad],
        radius=14, fill=(255, 255, 255, 255)
    )
    qr_img = generate_qr_image(qr_data, size=qr_size).convert('RGBA')
    qr_border_img.paste(qr_img, (qr_border_pad + qr_padding, qr_border_pad + qr_padding))

    qr_x = rx0 + (RIGHT_W - qr_block) // 2
    img.paste(qr_border_img, (qr_x, qr_y), qr_border_img)
    draw = ImageDraw.Draw(img)

    # "CODE" label
    code_y = qr_y + qr_block + gap2
    code_label = "CODE"
    clb = draw.textbbox((0, 0), code_label, font=font_code_label)
    clw = clb[2] - clb[0]
    draw.text(
        (rx0 + (RIGHT_W - clw) // 2, code_y),
        code_label, fill=(255, 255, 255, 102), font=font_code_label
    )

    # Code box with value
    code_box_w = RIGHT_W - 48
    code_box_h = 22
    code_box_x = rx0 + 24
    code_box_y = code_y + 12
    code_rect = (code_box_x, code_box_y, code_box_x + code_box_w, code_box_y + code_box_h)
    apply_glass_panel(
        img,
        code_rect,
        radius=8,
        tint_rgb=(4, 6, 12),
        tint_strength=0.35,
        blur_radius=4,
        opacity=190,
    )
    draw.rounded_rectangle(
        code_rect,
        radius=8,
        outline=(255, 255, 255, 25)
    )
    display_code = ticket_code[:18] if len(ticket_code) > 18 else ticket_code
    cvb = draw.textbbox((0, 0), display_code, font=font_code_val)
    cvw = cvb[2] - cvb[0]
    cvh = cvb[3] - cvb[1]
    draw.text(
        (code_box_x + (code_box_w - cvw) // 2,
         code_box_y + (code_box_h - cvh) // 2),
        display_code, fill=(255, 255, 255, 204), font=font_code_val
    )

    # "Scan at entry"
    scan_y = code_box_y + code_box_h + gap3
    scan_text = "SCAN AT ENTRY"
    sb = draw.textbbox((0, 0), scan_text, font=font_scan)
    sw = sb[2] - sb[0]
    draw.text(
        (rx0 + (RIGHT_W - sw) // 2, scan_y),
        scan_text, fill=(255, 255, 255, 128), font=font_scan
    )

    # ================================================================
    #  CENTER SECTION — Title / Info Box / Details
    #  CSS: flex-1 px-10 py-8 flex flex-col justify-between
    # ================================================================
    cx0 = LEFT_W
    pad_x = 40   # px-10 = 2.5rem = 40px
    pad_y = 32   # py-8  = 2rem   = 32px
    usable_h = TICKET_H - FOOTER_H - pad_y * 2  # 400-28-64 = 308

    # --- Measure each group's height ---
    # Group 1: title block (mb-6 wrapper + title + subtitle row)
    title_text = "CMHS Grand Iftar"
    tb = draw.textbbox((0, 0), title_text, font=font_title)
    title_h = tb[3] - tb[1]

    sub_text = "Mahfil 2026"
    stb = draw.textbbox((0, 0), sub_text, font=font_subtitle)
    sub_h = stb[3] - stb[1]
    title_gap = 12  # slightly larger separation between title and subtitle row
    group1_h = title_h + title_gap + sub_h

    # Group 2: info box
    # HTML: bg-black/40 rounded-xl px-5 py-4 border inline-block
    #   inner: flex items-center gap-6
    #   children: [name_col, sep(1px h-10), batch_col, sep(1px h-10), phone_col]
    info_pad_y = 16   # py-4
    info_pad_x = 20   # px-5
    info_gap = 24     # gap-6 = 1.5rem = 24px (between EACH flex child)
    sep_h = 40        # h-10 = 2.5rem = 40px

    name_bb = draw.textbbox((0, 0), name, font=font_name)
    name_h = name_bb[3] - name_bb[1]
    label_bb = draw.textbbox((0, 0), "GUEST NAME", font=font_label)
    label_h = label_bb[3] - label_bb[1]
    label_gap = 4   # mb-1

    # Row inner height = max(column content heights, separator h-10)
    col_content_h = label_h + label_gap + name_h
    row_h = max(col_content_h, sep_h)
    group2_h = info_pad_y * 2 + row_h

    # Group 3: details row
    det_lbl_bb = draw.textbbox((0, 0), "X", font=font_detail_lbl)
    det_lbl_h = det_lbl_bb[3] - det_lbl_bb[1]
    det_val_bb = draw.textbbox((0, 0), "March 18, 2026", font=font_detail_val)
    det_val_h = det_val_bb[3] - det_val_bb[1]
    det_content_h = det_lbl_h + 4 + det_val_h
    det_sep_h = 32   # h-8 = 2rem = 32px
    group3_h = max(det_content_h, det_sep_h)

    remaining = usable_h - group1_h - group2_h - group3_h
    gap = max(remaining // 2, 10)

    # --- Y positions (justify-between) ---
    g1_y = pad_y
    g2_y = g1_y + group1_h + gap
    g3_y = g2_y + group2_h + gap

    # ── Draw Group 1: Title ─────────────────────────────────────────
    draw.text(
        (cx0 + pad_x, g1_y),
        title_text,
        fill=hex_to_rgb('#e0f2fe'),
        font=font_title,
        stroke_width=1,
        stroke_fill=hex_to_rgb('#cbd5ff')
    )

    # Subtitle row: decorative line (w-12 = 48px) + gap-3 (12px) + text
    sub_y = g1_y + title_h + title_gap
    line_x = cx0 + pad_x
    line_cy = sub_y + sub_h // 2
    draw.line(
        [(line_x, line_cy), (line_x + 48, line_cy)],
        fill=(186, 230, 253, 100), width=2
    )
    draw.text(
        (line_x + 48 + 12, sub_y),
        sub_text, fill=hex_to_rgb('#dbeafe'), font=font_subtitle
    )

    # ── Draw Group 2: Info Box ──────────────────────────────────────
    # Measure column text widths
    name_w = name_bb[2] - name_bb[0]
    lbl_name_bb = draw.textbbox((0, 0), "GUEST NAME", font=font_label)
    lbl_name_w = lbl_name_bb[2] - lbl_name_bb[0]
    col1_w = max(name_w, lbl_name_w)

    batch_bb = draw.textbbox((0, 0), batch, font=font_batch)
    batch_w = batch_bb[2] - batch_bb[0]
    lbl_batch_bb = draw.textbbox((0, 0), "BATCH", font=font_label)
    lbl_batch_w = lbl_batch_bb[2] - lbl_batch_bb[0]
    col2_w = max(batch_w, lbl_batch_w)

    phone_bb = draw.textbbox((0, 0), phone, font=font_contact)
    phone_w = phone_bb[2] - phone_bb[0]
    lbl_phone_bb = draw.textbbox((0, 0), "CONTACT", font=font_label)
    lbl_phone_w = lbl_phone_bb[2] - lbl_phone_bb[0]
    col3_w = max(phone_w, lbl_phone_w)

    def _info_box_width(gap_value):
        return (info_pad_x * 2
                + col1_w + gap_value + 1 + gap_value
                + col2_w + gap_value + 1 + gap_value
                + col3_w)

    info_gap_actual = info_gap
    total_box_w = _info_box_width(info_gap_actual)
    min_box_w = 470
    if total_box_w < min_box_w:
        extra = min_box_w - total_box_w
        info_gap_actual = info_gap + extra / 4
        total_box_w = _info_box_width(info_gap_actual)

    box_x0 = cx0 + pad_x
    box_y0 = g2_y
    box_x1 = box_x0 + total_box_w
    box_y1 = box_y0 + group2_h

    apply_glass_panel(
        img,
        (box_x0, box_y0, box_x1, box_y1),
        radius=12,
        tint_rgb=(6, 10, 24),
        tint_strength=0.32,
        blur_radius=6,
        opacity=194,
    )
    draw.rounded_rectangle(
        [box_x0, box_y0, box_x1, box_y1],
        radius=12,
        outline=(186, 230, 253, 102)
    )

    lbl_color = (255, 255, 255, 153)  # opacity 0.6
    val_color = (255, 255, 255, 255)

    # Vertical center offset for text within the row (items-center)
    row_center_y = box_y0 + info_pad_y + row_h // 2

    # Column 1 — Guest Name
    c1x = box_x0 + info_pad_x
    c1_top = row_center_y - col_content_h // 2
    draw.text((c1x, c1_top), "GUEST NAME", fill=lbl_color, font=font_label)
    draw.text((c1x, c1_top + label_h + label_gap), name, fill=val_color, font=font_name)

    # Separator 1 — gradient vertical line (h-10 centered)
    gap_value = info_gap_actual
    sep1_x = c1x + col1_w + gap_value
    sep_top = row_center_y - sep_h // 2
    sep_bot = sep_top + sep_h
    sep1_x_int = int(round(sep1_x))
    # Draw gradient: sky-200/30 → blue-300/50 → sky-200/30
    for sy in range(sep_top, sep_bot):
        st = (sy - sep_top) / max(sep_bot - sep_top - 1, 1)
        if st < 0.5:
            sa = int(lerp_color((76,), (128,), st * 2)[0])
        else:
            sa = int(lerp_color((128,), (76,), (st - 0.5) * 2)[0])
        draw.point((sep1_x_int, sy), fill=(166, 213, 253, sa))

    # Column 2 — Batch
    c2x = sep1_x + 1 + gap_value
    batch_content_h = label_h + label_gap + (batch_bb[3] - batch_bb[1])
    c2_top = row_center_y - batch_content_h // 2
    draw.text((c2x, c1_top), "BATCH", fill=lbl_color, font=font_label)
    draw.text((c2x, c1_top + label_h + label_gap), batch, fill=val_color, font=font_batch)

    # Separator 2
    sep2_x = c2x + col2_w + gap_value
    sep2_x_int = int(round(sep2_x))
    for sy in range(sep_top, sep_bot):
        st = (sy - sep_top) / max(sep_bot - sep_top - 1, 1)
        if st < 0.5:
            sa = int(lerp_color((76,), (128,), st * 2)[0])
        else:
            sa = int(lerp_color((128,), (76,), (st - 0.5) * 2)[0])
        draw.point((sep2_x_int, sy), fill=(166, 213, 253, sa))

    # Column 3 — Contact
    c3x = sep2_x + 1 + gap_value
    draw.text((c3x, c1_top), "CONTACT", fill=lbl_color, font=font_label)
    # Contact value baseline-aligned with other values
    phone_val_h = phone_bb[3] - phone_bb[1]
    phone_val_y = c1_top + label_h + label_gap + (name_h - phone_val_h) // 2
    draw.text(
        (c3x, phone_val_y),
        phone, fill=(255, 255, 255, 230), font=font_contact
    )

    # ── Draw Group 3: Details Row ───────────────────────────────────
    # HTML: flex items-center gap-10 opacity-80
    # Children: [date_col, sep(1px h-8), time_col, sep(1px h-8), venue_col]
    # gap-10 = 40px between each flex child
    det_gap = 40  # gap-10 = 2.5rem = 40px
    dy = g3_y
    dx = cx0 + pad_x
    detail_lbl_color = (255, 255, 255, 153)
    detail_val_color = (255, 255, 255, 204)   # opacity 0.8
    det_row_cy = dy + group3_h // 2  # vertical center

    details = [
        ("DATE", "March 18, 2026"),
        ("TIME", "03:00 PM"),
        ("VENUE", "CMHS Campus"),
    ]

    for i, (lbl, val) in enumerate(details):
        if i > 0:
            # Separator: 1px wide, h-8 (32px), centered vertically, gradient
            sep_cx = dx
            sep_t = det_row_cy - det_sep_h // 2
            sep_b = sep_t + det_sep_h
            for sy in range(sep_t, sep_b):
                st = (sy - sep_t) / max(sep_b - sep_t - 1, 1)
                if st < 0.5:
                    sa = int(lerp_color((76,), (128,), st * 2)[0])
                else:
                    sa = int(lerp_color((128,), (76,), (st - 0.5) * 2)[0])
                draw.point((sep_cx, sy), fill=(166, 213, 253, sa))
            dx += 1 + det_gap  # past separator + gap

        det_top = det_row_cy - det_content_h // 2
        draw.text((dx, det_top), lbl, fill=detail_lbl_color, font=font_detail_lbl)
        draw.text((dx, det_top + det_lbl_h + 4), val, fill=detail_val_color, font=font_detail_val)

        vbb = draw.textbbox((0, 0), val, font=font_detail_val)
        dx += max(vbb[2] - vbb[0], draw.textbbox((0, 0), lbl, font=font_detail_lbl)[2] - draw.textbbox((0, 0), lbl, font=font_detail_lbl)[0]) + det_gap

    # ================================================================
    #  FOOTER
    # ================================================================
    footer_y = TICKET_H - FOOTER_H
    draw.rectangle([(0, footer_y), (TICKET_W, TICKET_H)], fill=(0, 0, 0, 153))
    draw.line([(0, footer_y), (TICKET_W, footer_y)], fill=(255, 255, 255, 25), width=1)

    fl = "Powered by: "
    fl_bold = "CMHS ALUMNI ASSOCIATION"
    flb = draw.textbbox((0, 0), fl, font=font_footer)
    fl_w = flb[2] - flb[0]
    fl_y = footer_y + (FOOTER_H - (flb[3] - flb[1])) // 2
    draw.text((24, fl_y), fl, fill=(255, 255, 255, 255), font=font_footer)
    draw.text((24 + fl_w, fl_y), fl_bold, fill=(255, 255, 255, 255), font=font_footer_bold)

    fr = "System Generated \u2022 Dev: Reshad (2019) \u2022 www.reshad.dev"
    frb = draw.textbbox((0, 0), fr, font=font_footer)
    fr_w = frb[2] - frb[0]
    draw.text(
        (TICKET_W - fr_w - 24, fl_y),
        fr, fill=(255, 255, 255, 255), font=font_footer
    )

    # ================================================================
    #  Flatten RGBA -> RGB on dark background and export PNG
    # ================================================================
    final = Image.new('RGB', (TICKET_W, TICKET_H), (15, 15, 24))  # body #0f0f18
    final.paste(img, (0, 0), img)

    if OUTPUT_SCALE and OUTPUT_SCALE != 1:
        upscale_w = int(TICKET_W * OUTPUT_SCALE)
        upscale_h = int(TICKET_H * OUTPUT_SCALE)
        final = final.resize((upscale_w, upscale_h), Image.LANCZOS)
        final = final.filter(ImageFilter.UnsharpMask(radius=1.2, percent=180, threshold=3))
        redraw_footer_layer(final, OUTPUT_SCALE, fl, fl_bold, fr)

    buf = io.BytesIO()
    final.save(buf, format='PNG', optimize=False, compress_level=5)
    buf.seek(0)
    return buf.getvalue()