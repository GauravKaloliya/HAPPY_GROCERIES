from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageCreateSerializer


class ContactMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ContactMessage model - read-only for frontend."""

    permission_classes = [IsAuthenticated]
    serializer_class = ContactMessageSerializer

    def get_queryset(self):
        user = self.request.user
        return ContactMessage.objects.filter(user=user).select_related('user')

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def submit(self, request):
        """
        Public endpoint to submit contact form.
        Can be called from frontend to submit contact messages.
        """
        serializer = ContactMessageCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Contact message submitted successfully! We\'ll get back to you soon.'},
            status=status.HTTP_201_CREATED
        )
