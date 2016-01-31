# -*- coding: utf-8 -*-
import json
from settings import MEDIA_ROOT, MEDIA_URL

# from django.conf import settings
from django.contrib import messages
# from django.contrib.auth.decorators import login_required
# from django.contrib.contenttypes.models import ContentType
# from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.shortcuts import render, render_to_response, get_object_or_404, render, redirect
from django.views.generic import View, TemplateView, DetailView, ListView, FormView, CreateView, UpdateView, DeleteView
# from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, Http404, HttpResponse, JsonResponse
from django.template import RequestContext, loader
from django.template.loader import get_template, render_to_string
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _, check_for_language, activate, to_locale, get_language


# Create your decorators here.


def ajax_request(function):
    def wrapper(request, *args, **kwargs):
        if request.is_ajax():
            print 'OK: request is AJAX'
            return function(request, *args, **kwargs)
        else:
            print 'ERROR: request != AJAX'
            d = {}
            d['request_types'] = 'GET and POST'
            return render_to_response('errors/ajax_required.html', d,
                context_instance=RequestContext(request))
    return wrapper


def ajax_get_request(function):
    def wrapper(request, *args, **kwargs):
        if request.is_ajax() or request.method != "GET":
            print 'OK: request is AJAX or != GET'
            return function(request, *args, **kwargs)
        else:
            print 'ERROR: request != AJAX and GET'
            d = {}
            d['request_types'] = 'GET'
            return render_to_response('errors/ajax_required.html', d,
                context_instance=RequestContext(request))
    return wrapper


def ajax_post_request(function):
    def wrapper(request, *args, **kwargs):
        if request.is_ajax() or request.method != "POST":
            print 'OK: request is AJAX or != POST'
            return function(request, *args, **kwargs)
        else:
            print 'ERROR: request != AJAX and POST'
            d = {}
            d['request_types'] = 'POST'
            return render_to_response('errors/ajax_required.html', d,
                context_instance=RequestContext(request))
    return wrapper