import io
import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from .models import Ticket
from .serializers import TicketSerializer
from .ticket_engine import render_ticket_html
from .ticket_image import render_ticket_image

class UserTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            ticket = Ticket.objects.get(user=request.user)
            serializer = TicketSerializer(ticket)
            
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Ticket.DoesNotExist:
            return Response({"detail": "No ticket found for this user."}, status=status.HTTP_404_NOT_FOUND)


class TicketDownloadView(APIView):
    """
    Download ticket as HTML page
    Endpoint: GET /api/tickets/download/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            ticket = Ticket.objects.get(user=request.user)
            
            # Render the ticket HTML
            html_content = render_ticket_html(ticket)
            
            # Return as HTML response
            response = HttpResponse(html_content, content_type='text/html')
            response['Content-Disposition'] = f'inline; filename="ticket_{ticket.ticket_code}.html"'
            
            return response
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "No ticket found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Error generating ticket: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CreateTicketAndUploadCloudinary(APIView):
    """
    Generate a ticket image using Pillow, upload to Cloudinary,
    and return the image URL.
    Endpoint: POST /api/tickets/generate-image/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            ticket = Ticket.objects.get(user=request.user)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "No ticket found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Render ticket as PNG bytes using Pillow
            png_bytes = render_ticket_image(ticket)

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                io.BytesIO(png_bytes),
                folder="tickets",
                public_id=f"ticket_{ticket.ticket_code}",
                overwrite=True,
                resource_type="image",
            )

            image_url = result.get("secure_url", result.get("url"))

            return Response(
                {"ticket_code": ticket.ticket_code, "image_url": image_url},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": f"Error generating ticket image: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )