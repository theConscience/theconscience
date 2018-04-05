# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url, include
from rest_framework import routers
from . import views

router= routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'martial_arts', views.MartialArtViewSet)


urlpatterns = [

    url(r'^$', views.martial_arts_list, name='martial_arts_list'),
    url(r'^list_class_based/$', views.MartialListView.as_view(), name='martial_arts_list_cbv'),

    url(r'^(?P<martial_art_pk>\d+)/detail/$', views.martial_art_detail, name='martial_art_detail'),
    url(r'^(?P<pk>\d+)/detail_class_based/$', views.MartialArtDetailView.as_view(), name='martial_art_detail_cbv'),

    url(r'^add/$', views.martial_art_add, name='martial_art_add'),
    url(r'^add_class_based/$', views.AddView.as_view(), name='martial_art_add_cbv'),

    url(r'^(?P<martial_art_pk>\d+)/edit/$', views.martial_art_edit, name='martial_art_edit'),
    url(r'^(?P<pk>\d+)/edit_class_based/$', views.MartialArtUpdateView.as_view(), name='martial_art_update_cbv'),

    url(r'^(?P<martial_art_pk>\d+)/delete/$', views.martial_art_delete, name='martial_art_delete'),
    url(r'^(?P<pk>\d+)/delete_class_based/$', views.MartialArtDeleteView.as_view(), name='martial_art_delete_cbv'),

    url(r'^delete_success/$', views.delete_success, name='delete_success'),

    url(r'^api/', include(router.urls)),
    url(r'^api/api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]