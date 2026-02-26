import qrcode
import qrcode.image.svg
from io import BytesIO
from django.template.loader import render_to_string
from django.conf import settings


def generate_qr_code_svg(data):
    """
    Generate QR code as SVG string
    
    Args:
        data: The data to encode in the QR code (typically ticket ID or URL)
    
    Returns:
        str: SVG markup as a string
    """
    factory = qrcode.image.svg.SvgPathImage
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1,
        image_factory=factory
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to string
    stream = BytesIO()
    img.save(stream)
    svg_string = stream.getvalue().decode('utf-8')
    
    return svg_string


def render_ticket_html(ticket):
    """
    Render ticket HTML with user data and QR code
    
    Args:
        ticket: Ticket model instance
    
    Returns:
        str: Rendered HTML string
    """
    user = ticket.user
    
    # Generate QR code with ticket verification URL or ID
    qr_data = f"{settings.SITE_URL}/verify/{ticket.id}" if hasattr(settings, 'SITE_URL') else str(ticket.id)
    qr_code_svg = generate_qr_code_svg(qr_data)
    
    # Prepare context for template
    context = {
        'name': user.name or 'Guest',
        'batch': user.batch or 'N/A',
        'phone': user.phone,
        'qr_code_svg': qr_code_svg,
        'ticket_code_short': ticket.ticket_code,
        'ticket_code': ticket.ticket_code,
    }
    
    # Render the template
    html = render_to_string('ticket.html', context)
    
    return html
