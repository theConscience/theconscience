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
from django.views.generic.edit import FormMixin, ProcessFormView
# from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, Http404, HttpResponse, JsonResponse
from django.template import RequestContext, loader
from django.template.loader import get_template, render_to_string
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _, check_for_language, activate, to_locale, get_language

from project_decorators import ajax_request, ajax_get_request, ajax_post_request


# Create your mixins here.


class AjaxGeneral(TemplateView):
    template_name = None

    def get(self, request):
        print 'CBV: AjaxGeneral GET request :)'
        data = {}
        return render_to_response(self.template_name, data,
                                  context_instance=RequestContext(request))

    # # def post(self, request, **kwargs):
    # #     print 'AjaxGeneral POST request :)'
    # #     # print kwargs
    # #     # pk = kwargs['pk']
    # #     data = {}
    # #     return render_to_response(self.template_name, data,
    # #         context_instance=RequestContext(request))

    # def get_context_data(self, **kwargs):
    #     context = super(AjaxGeneral, self).get_context_data(**kwargs)
    #     if 'pk' in self.kwargs:
    #         context['object'] = get_object_or_404(MartialArt, slug=self.kwargs['pk'])
    #         # context['objects'] = get_objects_by_user(self.request.user)

    #     return context

    @method_decorator(ajax_request)
    def dispatch(self, *args, **kwargs):
        return super(AjaxGeneral, self).dispatch(*args, **kwargs)


class AjaxRequired(View):

    @method_decorator(ajax_request)
    def dispatch(self, request, *args, **kwargs):
        return super(AjaxRequired, self).dispatch(request, *args, **kwargs)


class AjaxGetRequired(View):

    @method_decorator(ajax_get_request)
    def dispatch(self, request, *args, **kwargs):
        return super(AjaxGetRequired, self).dispatch(request, *args, **kwargs)


class AjaxPostRequired(View):

    @method_decorator(ajax_post_request)
    def dispatch(self, request, *args, **kwargs):
        return super(AjaxPostRequired, self).dispatch(request, *args, **kwargs)


# #
# MIXED RESPONSE VIEWS MIXINS


class ProcessFormMixedResponseView(ProcessFormView):
    '''
    set get_response_string attribute in your inherited view, to send a
    HttpResponse with rendered string to the client
    '''
    def get(self, request, *args, **kwargs):
        if self.get_response_string:
            answer_data = render_to_string(self.template_name, self.get_context_data())
            return HttpResponse(answer_data, content_type="text/plain")
        return self.render_to_response(self.get_context_data())


# #
# FORM JSON RESPONSE MIXINS


class FormJsonValidMixin(FormMixin):

    def form_valid(self, form):
        print 'CBV: form is valid :)'
        return JsonResponse(self.get_valid_data())

    def get_valid_data(self):
        d = {}
        if self.json_answer_valid:
            d = self.json_answer_valid
        print 'CBV: json response is ', d
        return d


class FormJsonInvalidMixin(FormMixin):

    def form_invalid(self, form):
        print 'CBV: form is invalid :(('
        return JsonResponse(self.get_invalid_data())

    def get_invalid_data(self):
        d = {}
        if self.json_answer_invalid:
            d = self.json_answer_invalid
        print 'CBV: json response is ', d
        return d


# #
# OTHER MIXINS


class JSONResponseMixin(object):
    """
    A mixin that can be used to render a JSON response.
    """
    def render_to_json_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        """
        Returns an object that will be serialized as JSON by json.dumps().
        """
        # Note: This is *EXTREMELY* naive; in reality, you'll need
        # to do much more complex handling to ensure that arbitrary
        # objects -- such as Django model instances or querysets
        # -- can be serialized as JSON.

        # context = {'close': 'close modal'}

        return context


# class MartialArtDeleteAjaxResponseMixin(object):  # перенесен в martial.mixins
#     """
#     Mixin to add AJAX support to a form.
#     Must be used with an object-based FormView (e.g. CreateView)
#     """

#     def form_valid(self, form):
#         # We make sure to call the parent's form_valid() method because
#         # it might do some processing (in the case of CreateView, it will
#         # call form.save() for example).
#         response = super(MartialArtDeleteAjaxResponseMixin, self).form_valid(form)
#         if self.request.is_ajax():
#             if self.request.method == 'POST':
#                 answer = {
#                     'close': 'close modal'
#                 }
#                 return JsonResponse(answer)
#                 # HttpResponse(json.dumps(answer), content_type='application/json')
#         else:
#             return response


class AjaxableResponseMixin(object):  # вместо двух предыдущих миксинов можно добавить в MartialDeleteView этот
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """
    def render_to_json_response(self, context, **response_kwargs):
        data = json.dumps(context)
        response_kwargs['content_type'] = 'application/json'
        return HttpResponse(data, **response_kwargs)

    def form_invalid(self, form):
        response = super(AjaxableResponseMixin, self).form_invalid(form)
        if self.request.is_ajax():
            return self.render_to_json_response(form.errors, status=400)
        else:
            return response

    def form_valid(self, form):
        # We make sure to call the parent's form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(AjaxableResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            answer = {
                # 'close': 'close modal'
            }
            return self.render_to_json_response(answer)
        else:
            return response