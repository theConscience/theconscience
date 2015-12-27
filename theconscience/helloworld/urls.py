# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include

urlpatterns = patterns('helloworld.views',
    url(r'^$', 'index', name='index'),
)    