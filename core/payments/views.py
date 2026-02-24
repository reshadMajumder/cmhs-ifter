from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Payment
from .serializers import PaymentSerializer
from .email import send_email
from django.db import transaction
from tickets.models import Ticket
class PaymentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):

        try:
            ticket = Payment.objects.filter(user=request.user).order_by('-created_at')
            serializer = PaymentSerializer(ticket,many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({"detail": "No payments found for this user."}, status=status.HTTP_404_NOT_FOUND)



    @transaction.atomic
    def post(self, request):
        serializer = PaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payment_type = serializer.validated_data.get("payment_type")

        try:
            # --- Rule enforcement ---
            if payment_type == "registration":
                existing_registration = Payment.objects.filter(
                    user=request.user, payment_type="registration"
                ).exists()
                if existing_registration:
                    return Response(
                        {"detail": "You have already made a registration payment."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # --- Create the payment ---
            payment = serializer.save(user=request.user)

            # If donation → update ticket
            if payment_type == "donation":
                ticket, _ = Ticket.objects.get_or_create(user=request.user)
                ticket.has_donation = True
                ticket.save()

            # Send notification email (do not block payment creation)
            send_email(payment)

            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": f"Payment creation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )