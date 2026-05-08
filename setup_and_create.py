# Install dependencies first
import subprocess
import sys

# Install required packages
subprocess.check_call([sys.executable, "-m", "pip", "install", "djangorestframework", "django-cors-headers"])

# Now create superuser
result = subprocess.run([sys.executable, "manage.py", "createsuperuser"], cwd=".")
print(result.returncode)