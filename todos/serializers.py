from rest_framework import serializers
from .models import Task, TodoList, Tag, TaskStep, TaskNote

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']


class TaskStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskStep
        fields = ['id', 'title', 'is_completed', 'order']


class TaskNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskNote
        fields = ['id', 'content', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), write_only=True, source='tags', required=False
    )
    steps_count = serializers.SerializerMethodField()
    completed_steps_count = serializers.SerializerMethodField()
    subtasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'is_completed', 'is_important',
            'is_my_day', 'priority', 'due_date', 'reminder_date',
            'todo_list', 'parent_task', 'tags', 'tag_ids',
            'steps_count', 'completed_steps_count', 'subtasks_count',
            'order', 'completed_at', 'created_at', 'updated_at'
        ]
    
    def get_steps_count(self, obj):
        return obj.steps.count()
    
    def get_completed_steps_count(self, obj):
        return obj.steps.filter(is_completed=True).count()
    
    def get_subtasks_count(self, obj):
        return obj.subtasks.count()


class TaskDetailSerializer(TaskSerializer):
    """Task batafsil ko'rinishi — steps va notes ham bilan"""
    steps = TaskStepSerializer(many=True, read_only=True)
    notes = TaskNoteSerializer(many=True, read_only=True)
    subtasks = TaskSerializer(many=True, read_only=True)
    
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['steps', 'notes', 'subtasks']


class TaskListSerializer(serializers.ModelSerializer):
    total_tasks = serializers.IntegerField(read_only=True, default=0)
    completed_tasks = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = TodoList
        fields = ['id', 'title', 'color', 'icon', 'order', 'total_tasks', 'completed_tasks', 'created_at']
