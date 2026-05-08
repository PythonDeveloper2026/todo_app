import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Try both possible paths
import sys
sys.path.insert(0, '.')

django.setup()

from users.models import User

# Create superuser
username = input("Username: ")
email = input("Email: ")
password = input("Password: ")

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser {username} created!")
else:
    print(f"User {username} already exists")