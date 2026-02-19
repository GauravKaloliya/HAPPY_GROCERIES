from rest_framework import serializers
from .models import ProductReview, ReviewHelpful


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    helpful_count = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_name', 'user_phone', 'product', 'order',
            'rating', 'title', 'comment', 'is_approved', 'is_verified_purchase',
            'helpful_count', 'user_has_voted', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_name', 'user_phone', 'is_approved',
            'is_verified_purchase', 'helpful_count', 'user_has_voted',
            'created_at', 'updated_at'
        ]
    
    def get_helpful_count(self, obj):
        return obj.helpful_votes.count()
    
    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""
    
    class Meta:
        model = ProductReview
        fields = ['rating', 'title', 'comment']
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class ReviewSummarySerializer(serializers.Serializer):
    """Serializer for review summary stats."""
    
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_breakdown = serializers.DictField(
        child=serializers.IntegerField()
    )
    can_review = serializers.BooleanField()
    user_review = ProductReviewSerializer(required=False)
