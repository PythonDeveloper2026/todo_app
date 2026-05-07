from django.db import models
from django.conf import settings

class Tag(models.Model):
    """
    Tasklar uchun teglar (masalan: #ish, #shaxsiy, #muhim)
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#6366f1')  # HEX rang
    
    class Meta:
        unique_together = ('user', 'name')
        db_table = 'tags'
    
    def __str__(self):
        return self.name


class TodoList(models.Model):
    """
    Foydalanuvchi o'z listlarini yaratadi: 'Ish', 'Shaxsiy', 'Xarid'...
    Microsoft Todo'dagi 'Lists' ga o'xshash.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lists')
    title = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default='#6366f1')
    icon = models.CharField(max_length=50, default='list')  # emoji yoki icon nomi
    is_default = models.BooleanField(default=False)  # "My Day", "Important" kabi tizim listlari
    order = models.IntegerField(default=0)  # drag-and-drop tartibi uchun
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        db_table = 'todo_lists'
    
    def __str__(self):
        return self.title


class Task(models.Model):
    """
    Asosiy task modeli — loyihaning yuragi.
    """
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Urgent'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    todo_list = models.ForeignKey(TodoList, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    tags = models.ManyToManyField(Tag, blank=True, related_name='tasks')
    
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)  # Yulduzcha bilan belgilangan
    is_my_day = models.BooleanField(default=False)     # "My Day" ga qo'shilgan
    
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=1)
    due_date = models.DateTimeField(null=True, blank=True)
    reminder_date = models.DateTimeField(null=True, blank=True)
    
    order = models.IntegerField(default=0)  # drag-and-drop uchun
    
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
        db_table = 'tasks'
    
    def __str__(self):
        return self.title


class TaskStep(models.Model):
    """
    Task ichidagi qadamlar (checklist items).
    Masalan: "Hisobot tayyorlash" task'i uchun:
      [x] Ma'lumot yig'ish
      [ ] Jadval tuzish
      [ ] Tahrirlash
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(max_length=300)
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        db_table = 'task_steps'


class TaskNote(models.Model):
    """
    Task'ga biriktirilgan qo'shimcha eslatmalar.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_notes'


class RecurringRule(models.Model):
    """
    Qaytariladigan tasklar uchun qoidalar.
    Masalan: "Har dushanba" yoki "Har 3 kunda".
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    ]
    
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='recurring_rule')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    interval = models.IntegerField(default=1)  # har necha kunda/haftada/oyda
    days_of_week = models.JSONField(null=True, blank=True)  # [0,1,2] = Dush, Sesh, Chor
    end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'recurring_rules'
