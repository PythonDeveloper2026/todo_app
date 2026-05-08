from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from . import views

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'Todo API',
        'endpoints': {
            'lists': '/api/lists/',
            'tasks': '/api/tasks/',
            'tags': '/api/tags/',
            'stats': '/api/stats/',
            'search': '/api/search/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    # Lists
    path('lists/', views.TodoListView.as_view(), name='lists'),
    path('lists/<int:pk>/', views.TodoListDetailView.as_view(), name='list-detail'),
    path('lists/reorder/', views.ReorderListsView.as_view(), name='lists-reorder'),
    
    # Tasks
    path('tasks/', views.TaskListCreateView.as_view(), name='tasks'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:pk>/complete/', views.ToggleCompleteView.as_view(), name='task-complete'),
    path('tasks/<int:pk>/important/', views.ToggleImportantView.as_view(), name='task-important'),
    path('tasks/<int:pk>/my-day/', views.ToggleMyDayView.as_view(), name='task-my-day'),
    path('tasks/reorder/', views.ReorderTasksView.as_view(), name='tasks-reorder'),
    path('tasks/bulk-action/', views.BulkActionView.as_view(), name='bulk-action'),
    
    # Subtasks (steps)
    path('tasks/<int:task_id>/steps/', views.StepListCreateView.as_view(), name='steps'),
    path('steps/<int:pk>/', views.StepDetailView.as_view(), name='step-detail'),
    path('steps/<int:pk>/complete/', views.ToggleStepCompleteView.as_view(), name='step-complete'),
    
    # Notes
    path('tasks/<int:task_id>/notes/', views.NoteListCreateView.as_view(), name='notes'),
    path('notes/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
    
    # Tags
    path('tags/', views.TagListCreateView.as_view(), name='tags'),
    path('tags/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail'),
    path('tasks/<int:pk>/tags/', views.TaskTagsView.as_view(), name='task-tags'),
    
    # Special views
    path('tasks/today/', views.TodayTasksView.as_view(), name='today-tasks'),
    path('tasks/my-day/', views.MyDayTasksView.as_view(), name='my-day-tasks'),
    path('tasks/important/', views.ImportantTasksView.as_view(), name='important-tasks'),
    path('tasks/upcoming/', views.UpcomingTasksView.as_view(), name='upcoming-tasks'),
    path('tasks/overdue/', views.OverdueTasksView.as_view(), name='overdue-tasks'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('stats/', views.StatsView.as_view(), name='stats'),
]
