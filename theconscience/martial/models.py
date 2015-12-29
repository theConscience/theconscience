# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime

from django.db import models
from django.utils.translation import get_language, ugettext_lazy as _

TAG_CHOICES = (
  ('weapon',_(u'оружие')),
  ('fighting',_(u'ударная')),
  ('wrestling',_(u'борьба')),
  ('technicks',_(u'приёмчики')),
)

# Create your models here.
class MartialArt(models.Model):
    title = models.CharField(max_length=200, verbose_name=_(u'Название'))
    # метка
    hashtag = models.CharField(blank=True, null=True, max_length=50, choices=TAG_CHOICES, verbose_name=_(u'Метка'))
    art_type = models.CharField(blank=True, null=True, max_length=50, verbose_name=_(u'Тип'))
    description = models.TextField(verbose_name=_(u'Описание'))
    country = models.TextField(blank=True, null=True, verbose_name=_(u'Страна'))

    def __unicode__(self):
        return u'%s' % self.title

    # def set_country(self):
    #     if self.tag:
    #       if self.tag == 'django' or self.tag == 'python':
    #           self.language = 'python'
    #       elif self.tag == 'javascript':
    #           self.language = 'javascript'
    #       elif self.tag == 'css':
    #           self.language = 'css'
    #       elif self.tag == 'html':
    #           self.language = 'html'
    #       elif self.tag == 'xml':
    #           self.language = 'xml'
