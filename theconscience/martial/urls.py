# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^index_class_based/', views.IndexView.as_view(greeting='Hello martial fan!')),

    url(r'^add/$', views.martial_art_add, name='martial_art_add'),
    url(r'^add_class_based/', views.AddView.as_view(greeting='Adding martial art!')),

    url(r'^(?P<martial_art_id>\d+)/edit/$', views.martial_art_edit, name='martial_art_edit'),
    url(r'^(?P<martial_art_id>\d+)/edit_class_based/', views.EditView.as_view(greeting='Edit martial art!')),

    url(r'^(?P<martial_art_id>\d+)/delete/$', views.martial_art_delete, name='martial_art_delete'),
    url(r'^(?P<martial_art_id>\d+)/delete_class_based/', views.DeleteView.as_view(greeting='Deleting martial art!')),
]