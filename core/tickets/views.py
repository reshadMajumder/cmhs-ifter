from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Ticket
from .serializers import TicketSerializer

class UserTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            ticket = Ticket.objects.get(user=request.user)
            serializer = TicketSerializer(ticket)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Ticket.DoesNotExist:
            return Response({"detail": "No ticket found for this user."}, status=status.HTTP_404_NOT_FOUND)
