from django.contrib import admin
from .models import Task, TodoList, Tag, TaskStep, TaskNote, RecurringRule

class TaskStepInline(admin.TabularInline):
    model = TaskStep
    extra = 0

class TaskNoteInline(admin.TabularInline):
    model = TaskNote
    extra = 0

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'todo_list', 'priority', 'is_completed', 'due_date']
    list_filter = ['is_completed', 'priority', 'is_important', 'is_my_day']
    search_fields = ['title', 'description', 'user__username']
    inlines = [TaskStepInline, TaskNoteInline]
    readonly_fields = ['created_at', 'updated_at', 'completed_at']

@admin.register(TodoList)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'color', 'order']

admin.site.register(Tag)
admin.site.register(RecurringRule)
