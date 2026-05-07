from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('todos.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# React SPA uchun — barcha boshqa so'rovlar React'ga yo'naltiriladi
# Bu kod OXIRIDA bo'lishi shart!
urlpatterns += [
    re_path(r'^(?!admin|api|media|static).*$', TemplateView.as_view(template_name='index.html')),
]
