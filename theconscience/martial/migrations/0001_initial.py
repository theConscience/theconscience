# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-27 19:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MartialArt',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435')),
                ('hashtag', models.CharField(blank=True, choices=[('weapon', '\u043e\u0440\u0443\u0436\u0438\u0435'), ('fighting', '\u0443\u0434\u0430\u0440\u043d\u0430\u044f'), ('wrestling', '\u0431\u043e\u0440\u044c\u0431\u0430'), ('technicks', '\u043f\u0440\u0438\u0451\u043c\u0447\u0438\u043a\u0438')], max_length=50, null=True, verbose_name='\u041c\u0435\u0442\u043a\u0430')),
                ('art_type', models.CharField(blank=True, max_length=50, null=True, verbose_name='\u0422\u0438\u043f')),
                ('description', models.TextField(verbose_name='\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435')),
                ('country', models.TextField(blank=True, null=True, verbose_name='\u0421\u0442\u0440\u0430\u043d\u0430')),
            ],
        ),
    ]