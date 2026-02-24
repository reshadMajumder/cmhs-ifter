from rest_framework import serializers
from .models import Ticket
from accounts.serializers import UserSerializer

class TicketSerializer(serializers.ModelSerializer):
    user= UserSerializer(read_only=True)
    class Meta:
        model = Ticket
        fields = "__all__"
        read_only_fields = ['user', 'id','has_donation']