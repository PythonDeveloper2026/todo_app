from django.urls import path
from . import views

urlpatterns = [
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
    
    # Special views
    path('tasks/today/', views.TodayTasksView.as_view(), name='today-tasks'),
    path('tasks/my-day/', views.MyDayTasksView.as_view(), name='my-day-tasks'),
    path('tasks/important/', views.ImportantTasksView.as_view(), name='important-tasks'),
    path('tasks/upcoming/', views.UpcomingTasksView.as_view(), name='upcoming-tasks'),
    path('tasks/overdue/', views.OverdueTasksView.as_view(), name='overdue-tasks'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('stats/', views.StatsView.as_view(), name='stats'),
]
