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


def index(request):
    return render_to_response('index.html', {}, RequestContext(request))