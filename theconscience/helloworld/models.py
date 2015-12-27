from __future__ import unicode_literals

from django.db import models

# Create your models here.


class Message(models.Model):
    message_name = models.CharField(max_length=50)
    message_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('the date published')

    def __str__(self):
        return self.message_name
