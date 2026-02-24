from django.db import models
from cloudinary.models import CloudinaryField


class Notice(models.Model):
    title = models.CharField(max_length=55)
    content = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.title


class Sponsors(models.Model):
    name = models.CharField(max_length=55)
    # store sponsor logos in Cloudinary instead of local MEDIA_ROOT
    logo = CloudinaryField('image', blank=True, null=True)
    serial_number = models.IntegerField(unique=True,blank=True, null=True)


    def __str__(self):
        return self.name
    

class ContactMessage(models.Model):
    CHOICES = [
        ('General Inquiry', 'General Inquiry'),
        ('Feedback', 'Feedback'),
        ('Support', 'Support'),
        ('Volunteering', 'Volunteering'),
    ]
    name = models.CharField(max_length=100,null=True,blank=True)
    mobile = models.CharField(max_length=15,null=True,blank=True)
    subject = models.CharField(max_length=200, choices=CHOICES,null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True,null=True,blank=True)

    def __str__(self):
        return f'Message from {self.name} - {self.subject}'
    