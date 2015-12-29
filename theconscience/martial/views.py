# -*- coding: utf-8 -*-
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
# from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _, check_for_language, activate, to_locale, get_language

from django.contrib.auth.models import User

from martial.models import MartialArt
from martial.forms import MartialArtForm


# Create your views here.


def index(request):

    user = request.user

    martial_arts_list = MartialArt.objects.all().order_by('-id')
    # template = loader.get_template('martial/index.html')

    if request.method == "GET":
        martial_art_form = MartialArtForm()

    return render(request, 'martial/index.html', {
                              'martial_arts_list': martial_arts_list,
                              'martial_art_form': martial_art_form,
                              })


class IndexView(View):
    greeting = "Good Day"

    def get(self, request):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)


def martial_art_add(request):
    return HttpResponse('add')


class AddView(View):
    greeting = "Good Day"

    def get(self, request):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)


def martial_art_edit(request, martial_art_id):
    return HttpResponse('edit')


class EditView(View):
    greeting = "Good Day"

    def get(self, request, martial_art_id):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)


def martial_art_delete(request, martial_art_id):
    return HttpResponse('delete')


class DeleteView(View):
    greeting = "Good Day"

    def get(self, request, martial_art_id):
        # <view logic>
        martial_art_form = MartialArtForm()
        return HttpResponse(self.greeting)