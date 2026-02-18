from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta

from .models import ActivityLog
from .serializers import ActivityLogSerializer, ActivityLogCreateSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    """ViewSet for ActivityLog model."""

    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ActivityLog.objects.filter(user=user).select_related('user')

        # Filter by date range
        days = self.request.query_params.get('days')
        if days:
            date_from = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(created_at__gte=date_from)

        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)

        # Filter by page
        page = self.request.query_params.get('page')
        if page:
            queryset = queryset.filter(page__icontains=page)

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return ActivityLogCreateSerializer
        return ActivityLogSerializer

    def create(self, request, *args, **kwargs):
        """Create an activity log. This endpoint can be called from frontend."""
        serializer = ActivityLogCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Activity logged successfully'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def log_activity(self, request):
        """
        Public endpoint to log user activities.
        Can be called from frontend to track user actions.
        """
        serializer = ActivityLogCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Activity logged successfully'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get activity statistics for current user."""
        user = request.user
        queryset = ActivityLog.objects.filter(user=user)

        total_activities = queryset.count()
        activities_by_action = {}
        activities_by_page = {}

        for log in queryset:
            # Count by action
            action = log.get_action_display()
            activities_by_action[action] = activities_by_action.get(action, 0) + 1

            # Count by page
            page = log.page
            activities_by_page[page] = activities_by_page.get(page, 0) + 1

        return Response({
            'total_activities': total_activities,
            'by_action': activities_by_action,
            'by_page': activities_by_page,
        })
