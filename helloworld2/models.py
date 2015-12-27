from __future__ import unicode_literals

from django.db import models
from django.utils.translation import get_language, ugettext_lazy as _

# Create your models here.

MY_CHOICES = (
    ('Yes', _('Yes')),
    ('No', _('No')),
)


class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('the date published')

    def __str__(self):
        return self.question_text


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200, choices=MY_CHOICES)
    votes = models.IntegerField(default=0)
    test = models.CharField(max_length=200, default='Hi!')

    def __str__(self):
        return self.choice_text
