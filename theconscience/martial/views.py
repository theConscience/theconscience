# -*- coding: utf-8 -*-
import json
from settings import MEDIA_ROOT, MEDIA_URL

# from django.conf import settings
# from django.contrib import messages
# from django.contrib.auth.decorators import login_required
# from django.contrib.contenttypes.models import ContentType
# from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.core.urlresolvers import reverse

from django.shortcuts import render, render_to_response, get_object_or_404, render
from django.views.generic import View
# from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, Http404, HttpResponse, JsonResponse
from django.template import RequestContext, loader
from django.template.loader import get_template, render_to_string
# from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _, check_for_language, activate, to_locale, get_language
from django.core.urlresolvers import reverse

from django.contrib import messages
from django.contrib.auth.models import User

from martial.models import MartialArt
from martial.forms import MartialArtForm


# Create your views here.


def martial_arts_list(request):

    user = request.user

    martial_arts_list = MartialArt.objects.all().order_by('-id')
    # template = loader.get_template('martial/index.html')

    if request.method == "GET":
        martial_art_form = MartialArtForm()

    else:
        martial_art_form = MartialArtForm()

    return render_to_response('martial/list.html', {
                              'martial_arts_list': martial_arts_list,
                              'martial_art_form': martial_art_form,
                              }, RequestContext(request))


class ListView(View):
    greeting = "Good Day"

    def get(self, request):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)


def martial_art_add(request):
    print 'martial_art_add generic function view'
    if request.method == "POST":
        print 'martial_art_add view POST :)'
        martial_art_form = MartialArtForm(request.POST)
        if martial_art_form.is_valid():
            print 'martial_art_form is valid! :)'
            martial_art = martial_art_form.save(commit=False)
            # martial_art.set_language()
            martial_art.save()
            martial_art_form = MartialArtForm()
            print 'new form saved'
        else:
            print 'martial_art_form is invalid! :('
            messages.error(request, u'Code form is invalid!')
    else:
        print 'martial_art_add view GET :('
        raise Http404

    # возвращаемся обратно (во вьюху index)
    print 'Back to martial_arts_list view!'
    return HttpResponseRedirect(reverse('martial_arts_list'))


class AddView(View):
    form_class = MartialArtForm
    # template_name = 'some_template.html'

    def get(self, request):
        print 'AddView GET request :('
        # <view logic>
        raise Http404

    def post(self, request, *args, **kwargs):
        print 'AddView POST request :)'
        martial_art_form = self.form_class(request.POST)
        if martial_art_form.is_valid():
            print 'martial_art_form is valid! :)'
            martial_art = martial_art_form.save(commit=False)
            # martial_art.set_language()
            martial_art.save()
            martial_art_form = MartialArtForm()
            print 'new form saved'
        else:
            print 'martial_art_form is invalid! :('
            messages.error(request, u'Code form is invalid!')

        print 'Back to martial_arts_list view!'
        return HttpResponseRedirect(reverse('martial_arts_list'))


def martial_art_edit(request, martial_art_pk):

    martial_art = get_object_or_404(MartialArt, pk=martial_art_pk)

    if request.is_ajax():
        print 'martial_art_edit AJAX request :)'
        if request.method == 'POST':
            print 'martial_art_edit POST request :)'
            martial_art_form = MartialArtForm(request.POST, instance=martial_art)
            if martial_art_form.is_valid():
                print 'martial_art_form is valid! :)'
                martial_art = martial_art_form.save(commit=False)
                # code.set_language()
                martial_art.save()
                print 'martial_art instance is saved :)'
                msg = 'Martial Art "%s" is successfully changed' % martial_art
                answer = {'success': msg}
                return HttpResponse(json.dumps(answer), content_type='application/json')
            else:
                print 'martial_art_form is invalid! :('
                msg = 'The error occured while Martial Art "%s" saving...' % martial_art
                answer = {'error': msg}
                return HttpResponse(json.dumps(answer), content_type='application/json')
        else:
            print 'martial_art_edit GET request :)'
            martial_art_form = MartialArtForm(instance=martial_art)

            # my_template = get_template('martial/edit.html')
            # my_context = {'martial_art': martial_art, 'martial_art_form': martial_art_form}
            # my_str = my_template.render(my_context)

            answer_data = render_to_string('martial/edit.html', {
                                      'martial_art': martial_art,
                                      'martial_art_form': martial_art_form,
                                      })
            return HttpResponse(answer_data)

    else:
        raise Http404


class EditView(View):
    greeting = "Good Day"

    def get(self, request, martial_art_pk):
        print 'EditView GET request :)'
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)

    def post(self, request, *args, **kwargs):
        print 'EditView POST request :)'
        return HttpResponse(self.greeting)

    def ajax(self, request, *args, **kwargs):
        print 'EditView AJAX request :)'
        return HttpResponse(self.greeting)


def martial_art_delete(request, martial_art_pk):

    martial_art = get_object_or_404(MartialArt, pk=martial_art_pk)

    if request.is_ajax():
        print 'martial_art_delete AJAX request :)'
        if request.method == 'POST':
            print 'martial_art_delete POST request :)'
            martial_art.delete()
            print 'Martial Art deleted :)'

            msg = u'Martial Art "%s" is successfully deleted' % martial_art
            messages.success(request, msg)
            answer = {'close': 'close modal'}
            return HttpResponse(json.dumps(answer), content_type='application/json')

    raise Http404



class DeleteView(View):
    greeting = "Good Day"

    def get(self, request, martial_art_pk):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)