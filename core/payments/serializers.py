from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ['user', 'payment_approved','created_at']
        
    def validate(self, attrs):
        required_fields = ['phone', 'transaction_id', 'payment_type', 'amount']
        for field in required_fields:
            if not attrs.get(field):
                raise serializers.ValidationError({field: f"{field} is required."})
        return attrs

