# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include
from . import views

urlpatterns = [
    url(r'^$', views.martial_arts_list, name='martial_arts_list'),
    url(r'^list_class_based/', views.ListView.as_view(greeting='Martial arts list!'), name='martial_arts_list_cb'),

    url(r'^add/$', views.martial_art_add, name='martial_art_add'),
    url(r'^add_class_based/', views.AddView.as_view(), name='martial_art_add_cb'),

    url(r'^(?P<martial_art_pk>\d+)/edit/$', views.martial_art_edit, name='martial_art_edit'),
    url(r'^(?P<martial_art_pk>\d+)/edit_class_based/', views.EditView.as_view(), name='martial_art_edit_cb'),

    url(r'^(?P<martial_art_pk>\d+)/delete/$', views.martial_art_delete, name='martial_art_delete'),
    url(r'^(?P<martial_art_pk>\d+)/delete_class_based/', views.DeleteView.as_view(), name='martial_art_delete_cb'),
]