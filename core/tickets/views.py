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
from accounts.models import User
from payments.models import Payment
from .ticket_engine import render_ticket_html
from .ticket_image import render_ticket_image
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser

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


class CheckEntranceByQRView(APIView):
    """
    Check entrance by scanning ticket QR code.
    Endpoint: GET /api/tickets/check-entrance/<ticket_code>/
    Returns ticket details if valid
    """
    permission_classes = [IsAdminUser]

    def get(self, request, ticket_code):
        try:
            ticket = Ticket.objects.get(ticket_code=ticket_code)
            serializer = TicketSerializer(ticket)
            return Response(
                {
                    "status": "valid",
                    "message": "Ticket is valid",
                    "ticket": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Ticket.DoesNotExist:
            return Response(
                {
                    "status": "invalid",
                    "detail": "Ticket not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )


class MarkFoodReceivedView(APIView):
    """
    Mark food as received for a ticket by scanning QR code.
    Endpoint: POST /api/tickets/mark-food-received/<ticket_code>/
    Sets food_received to True
    """
    permission_classes = [IsAdminUser]

    def post(self, request, ticket_code):
        try:
            ticket = Ticket.objects.get(ticket_code=ticket_code)
            if ticket.food_received:
                return Response(
                    {
                        "status": "already_marked",
                        "message": "Food has already been marked as received for this ticket",
                        "ticket_code": ticket.ticket_code
                    },
                    status=status.HTTP_200_OK
                )
            else:
                ticket.food_received = True
                ticket.save()
                serializer = TicketSerializer(ticket)
                return Response(
                    {
                        "status": "success",
                        "message": "Food marked as received",
                        "ticket": serializer.data
                    },
                    status=status.HTTP_200_OK
                )
        except Ticket.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "detail": "Ticket not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "detail": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CheckEntranceByPhoneView(APIView):
    """
    Backup entrance check by user phone number.
    Verifies user has an approved registration payment and a ticket.
    Endpoint: GET /api/tickets/check-entrance-phone/<phone>/
    """
    permission_classes = [IsAdminUser]

    def get(self, request, phone):
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {"status": "invalid", "detail": "No user found with this phone number"},
                status=status.HTTP_404_NOT_FOUND
            )

        has_approved_payment = Payment.objects.filter(
            user=user,
            payment_type='registration',
            payment_approved=True
        ).exists()

        if not has_approved_payment:
            return Response(
                {"status": "invalid", "detail": "No approved registration payment found for this user"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            ticket = Ticket.objects.get(user=user)
            serializer = TicketSerializer(ticket)
            return Response(
                {
                    "status": "valid",
                    "message": "User has a valid ticket",
                    "ticket": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Ticket.DoesNotExist:
            return Response(
                {"status": "invalid", "detail": "No ticket found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )


class MarkFoodReceivedByPhoneView(APIView):
    """
    Backup food received marking by user phone number.
    Verifies user has an approved registration payment before marking.
    Endpoint: POST /api/tickets/mark-food-received-phone/<phone>/
    """
    permission_classes = [IsAdminUser]

    def post(self, request, phone):
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {"status": "error", "detail": "No user found with this phone number"},
                status=status.HTTP_404_NOT_FOUND
            )

        has_approved_payment = Payment.objects.filter(
            user=user,
            payment_type='registration',
            payment_approved=True
        ).exists()

        if not has_approved_payment:
            return Response(
                {"status": "error", "detail": "No approved registration payment found for this user"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            ticket = Ticket.objects.get(user=user)
        except Ticket.DoesNotExist:
            return Response(
                {"status": "error", "detail": "No ticket found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        if ticket.food_received:
            return Response(
                {
                    "status": "already_marked",
                    "message": "Food has already been marked as received for this user",
                    "ticket_code": ticket.ticket_code
                },
                status=status.HTTP_200_OK
            )

        ticket.food_received = True
        ticket.save()
        serializer = TicketSerializer(ticket)
        return Response(
            {
                "status": "success",
                "message": "Food marked as received",
                "ticket": serializer.data
            },
            status=status.HTTP_200_OK
        )

