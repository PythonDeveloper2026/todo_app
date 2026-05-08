from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Task, TodoList, Tag, TaskStep, TaskNote
from .serializers import (
    TaskSerializer, TaskListSerializer, TagSerializer,
    TaskStepSerializer, TaskNoteSerializer, TaskDetailSerializer
)

class TodoListView(generics.ListCreateAPIView):
    serializer_class = TaskListSerializer
    
    def get_queryset(self):
        return TodoList.objects.filter(user=self.request.user).annotate(
            total_tasks=Count('tasks'),
            completed_tasks=Count('tasks', filter=Q(tasks__is_completed=True))
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TodoListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskListSerializer
    
    def get_queryset(self):
        return TodoList.objects.filter(user=self.request.user)


class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET: Foydalanuvchi barcha tasklarini qaytaradi (filter parametrlari bilan).
    POST: Yangi task yaratadi.
    
    Query parameters:
    - list_id: Muayyan list bo'yicha filter
    - is_completed: true/false
    - priority: 1-4
    - tag: tag ID
    - search: qidiruv so'zi
    - page: sahifa raqami
    """
    serializer_class = TaskSerializer
    pagination_class = None
    
    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user, parent_task=None)
        
        list_id = self.request.query_params.get('list_id')
        if list_id:
            qs = qs.filter(todo_list_id=list_id)
        
        is_completed = self.request.query_params.get('is_completed')
        if is_completed is not None:
            qs = qs.filter(is_completed=is_completed.lower() == 'true')
        
        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)
        
        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__id=tag)
        
        return qs.prefetch_related('subtasks', 'steps', 'tags')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_serializer(self, *args, **kwargs):
        if self.request.query_params.get('page'):
            self.pagination_class = self.__class__.pagination_class
        return super().get_serializer(*args, **kwargs)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskDetailSerializer
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class ToggleCompleteView(APIView):
    def post(self, request, pk):
        task = Task.objects.get(pk=pk, user=request.user)
        task.is_completed = not task.is_completed
        task.completed_at = timezone.now() if task.is_completed else None
        task.save()
        return Response(TaskSerializer(task).data)


class ToggleImportantView(APIView):
    def post(self, request, pk):
        task = Task.objects.get(pk=pk, user=request.user)
        task.is_important = not task.is_important
        task.save()
        return Response(TaskSerializer(task).data)


class ToggleMyDayView(APIView):
    def post(self, request, pk):
        task = Task.objects.get(pk=pk, user=request.user)
        task.is_my_day = not task.is_my_day
        task.save()
        return Response(TaskSerializer(task).data)


class ReorderTasksView(APIView):
    """
    Drag-and-drop natijasida tasklar tartibini yangilaydi.
    Body: {"ordered_ids": [5, 2, 8, 1, 3]}
    """
    def post(self, request):
        ordered_ids = request.data.get('ordered_ids', [])
        for index, task_id in enumerate(ordered_ids):
            Task.objects.filter(id=task_id, user=request.user).update(order=index)
        return Response({'status': 'reordered'})


class BulkActionView(APIView):
    """
    Ko'p taskni bir vaqtda bajarish.
    Body: {"task_ids": [1,2,3], "action": "complete" | "delete" | "move"}
    """
    def post(self, request):
        task_ids = request.data.get('task_ids', [])
        action = request.data.get('action')
        tasks = Task.objects.filter(id__in=task_ids, user=request.user)
        
        if action == 'complete':
            tasks.update(is_completed=True, completed_at=timezone.now())
        elif action == 'delete':
            tasks.delete()
        elif action == 'move':
            list_id = request.data.get('list_id')
            tasks.update(todo_list_id=list_id)
        
        return Response({'status': 'done', 'affected': tasks.count()})


class TodayTasksView(APIView):
    """Bugun yaratilgan yoki bugun muddati tugaydigan tasklar"""
    def get(self, request):
        today = timezone.now().date()
        tasks = Task.objects.filter(
            user=request.user,
            is_completed=False
        ).filter(
            Q(due_date__date=today) | Q(created_at__date=today)
        )
        return Response(TaskSerializer(tasks, many=True).data)


class MyDayTasksView(APIView):
    """is_my_day=True bo'lgan tasklar"""
    def get(self, request):
        tasks = Task.objects.filter(user=request.user, is_my_day=True)
        return Response(TaskSerializer(tasks, many=True).data)


class ImportantTasksView(APIView):
    def get(self, request):
        tasks = Task.objects.filter(user=request.user, is_important=True)
        return Response(TaskSerializer(tasks, many=True).data)


class UpcomingTasksView(APIView):
    """Keyingi 7 kun ichida muddati tugaydigan tasklar"""
    def get(self, request):
        now = timezone.now()
        next_week = now + timedelta(days=7)
        tasks = Task.objects.filter(
            user=request.user,
            is_completed=False,
            due_date__range=[now, next_week]
        ).order_by('due_date')
        return Response(TaskSerializer(tasks, many=True).data)


class OverdueTasksView(APIView):
    def get(self, request):
        tasks = Task.objects.filter(
            user=request.user,
            is_completed=False,
            due_date__lt=timezone.now()
        )
        return Response(TaskSerializer(tasks, many=True).data)


class SearchView(APIView):
    """
    Barcha tasklar, listlar va teglar bo'yicha qidiradi.
    """
    def get(self, request):
        q = request.query_params.get('q', '')
        if len(q) < 2:
            return Response({'tasks': [], 'lists': [], 'tags': []})
        
        tasks = Task.objects.filter(
            user=request.user
        ).filter(
            Q(title__icontains=q) | Q(description__icontains=q)
        )[:20]
        
        lists = TodoList.objects.filter(user=request.user, title__icontains=q)[:5]
        tags = Tag.objects.filter(user=request.user, name__icontains=q)[:5]
        
        return Response({
            'tasks': TaskSerializer(tasks, many=True).data,
            'lists': TaskListSerializer(lists, many=True).data,
            'tags': TagSerializer(tags, many=True).data,
        })


class StatsView(APIView):
    """
    Dashboard uchun statistika ma'lumotlari.
    """
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        all_tasks = Task.objects.filter(user=user)
        
        return Response({
            'total': all_tasks.count(),
            'completed': all_tasks.filter(is_completed=True).count(),
            'pending': all_tasks.filter(is_completed=False).count(),
            'overdue': all_tasks.filter(is_completed=False, due_date__lt=timezone.now()).count(),
            'today': all_tasks.filter(due_date__date=today).count(),
            'important': all_tasks.filter(is_important=True).count(),
            'by_priority': {
                'low': all_tasks.filter(priority=1, is_completed=False).count(),
                'medium': all_tasks.filter(priority=2, is_completed=False).count(),
                'high': all_tasks.filter(priority=3, is_completed=False).count(),
                'urgent': all_tasks.filter(priority=4, is_completed=False).count(),
            }
        })


# Steps Views
class StepListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskStepSerializer
    
    def get_queryset(self):
        return TaskStep.objects.filter(task__user=self.request.user, task_id=self.kwargs['task_id'])
    
    def perform_create(self, serializer):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task)


class StepDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskStepSerializer
    
    def get_queryset(self):
        return TaskStep.objects.filter(task__user=self.request.user)


class ToggleStepCompleteView(APIView):
    def post(self, request, pk):
        step = TaskStep.objects.get(pk=pk, task__user=request.user)
        step.is_completed = not step.is_completed
        step.save()
        return Response(TaskStepSerializer(step).data)


# Notes Views
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskNoteSerializer
    
    def get_queryset(self):
        return TaskNote.objects.filter(task__user=self.request.user, task_id=self.kwargs['task_id'])
    
    def perform_create(self, serializer):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskNoteSerializer
    
    def get_queryset(self):
        return TaskNote.objects.filter(task__user=self.request.user)


# Tags Views
class TagListCreateView(generics.ListCreateAPIView):
    serializer_class = TagSerializer
    
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TagSerializer
    
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)


class TaskTagsView(APIView):
    """Taskga tag qo'shish/o'chirish"""
    def post(self, request, pk):
        task = Task.objects.get(pk=pk, user=request.user)
        tag_ids = request.data.get('tags', [])
        
        task.tags.clear()
        for tag_id in tag_ids:
            tag = Tag.objects.get(id=tag_id, user=request.user)
            task.tags.add(tag)
        
        return Response(TaskSerializer(task).data)


class ReorderListsView(APIView):
    def post(self, request):
        ordered_ids = request.data.get('ordered_ids', [])
        for index, list_id in enumerate(ordered_ids):
            TodoList.objects.filter(id=list_id, user=request.user).update(order=index)
        return Response({'status': 'reordered'})
