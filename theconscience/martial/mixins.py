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

from project_mixins import AjaxGeneral, AjaxRequired, AjaxGetRequired, AjaxPostRequired


# Create your mixins here.

class AjaxUpdateMixin(AjaxRequired):

    def get(self, request):
        print 'AjaxGetRequired GET request :)'
        return super(AjaxUpdateMixin, self).get(self, request)
        # data = {}
        # return render_to_response(self.template_name, data,
        #     context_instance=RequestContext(request))


# class ToStringResponseMixin(object):

#     def render_to_reponse(self, context):
#         return HttpResponse(self.convert_context_to_string(context))

#     def convert_context_to_string(self, context, extract_from_queryset=None):
#         context = render_to_string


# class JsonResponseMixin(object):

#     def render_to_reponse(self, context):
#         return HttpResponse(self.convert_context_to_json(context),
#                                  content_type='application/json')

#     def convert_context_to_json(self, context, extract_from_queryset=None):
#         pass


# class MixedView(View, ToStringResponseMixin, TemplateResponseMixin):

#     def get_context(self, request):
#         pass

#     def get(self, request, *args, **kwargs):
#         context = self.get_context(request)
#         if request.GET.get('format', 'html') == 'json' or self.template_name is None:
#             return ToStringResponseMixin.render_to_reponse(self, context)
#         else:
#             return TemplateResponseMixin.render_to_response(self, context)


class MartialArtUpdateAjaxResponseMixin(object):
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """

    def form_valid(self, form):
        # We make sure to call the parent's form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(MartialArtUpdateAjaxResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            if self.request.method == 'POST':
                msg = u'Martial Art is successfully updated'
                answer = {
                    'success': msg
                }
                # return JsonResponse(answer)
                HttpResponse(json.dumps(answer), content_type='application/json')
        else:
            return response

    def form_invalid(self, form):
        response = super(MartialArtUpdateAjaxResponseMixin, self).form_invalid(form)
        if self.request.is_ajax():
            if self.request.method == 'POST':
                msg = u'The error occured while Martial Art saving...'
                answer = {
                    'error': msg
                }
                # return JsonResponse(answer)
                HttpResponse(json.dumps(answer), content_type='application/json')
        else:
            return response


class MartialArtDeleteAjaxResponseMixin(object):
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """

    def form_valid(self, form):
        # We make sure to call the parent's form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(MartialArtDeleteAjaxResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            if self.request.method == 'POST':
                answer = {
                    'close': 'close modal'
                }
                return JsonResponse(answer)
                # HttpResponse(json.dumps(answer), content_type='application/json')
        else:
            return response