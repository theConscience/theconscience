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

from project_mixins import AjaxRequired, AjaxGetRequired, AjaxPostRequired,\
                           ProcessFormMixedResponseView, \
                           FormJsonValidMixin, FormJsonInvalidMixin  # AjaxGeneral, JSONResponseMixin, AjaxableResponseMixin

from mixins import AjaxUpdateMixin, MartialArtUpdateAjaxResponseMixin, MartialArtDeleteAjaxResponseMixin
from models import MartialArt
from forms import MartialArtForm

from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from serializers import UserSerializer, GroupSerializer, MartialArtSerializer


# Create your views here.


# * c-R-u-d * #############################################


def martial_arts_list(request):
    # user = request.user
    # template = loader.get_template('martial/index.html')

    martial_arts_list = MartialArt.objects.all().order_by('-id')
    martial_art_form = MartialArtForm()

    return render_to_response('martial/list.html', {
                              'martial_arts_list': martial_arts_list,
                              'martial_art_form': martial_art_form,
                              }, RequestContext(request))


class MartialListView(ListView):  # должен быть миксин для пустой формы, типо FormView

    model = MartialArt
    context_object_name = 'martial_arts_list'
    template_name = 'martial/list.html'

    def get_context_data(self, **kwargs):
        context = super(MartialListView, self).get_context_data(**kwargs)
        context['martial_art_form'] = MartialArtForm
        return context


# class MartialListView(View):
#     greeting = "Good Day"

#     def get(self, request):
#         # <view logic>
#         martial_art_form = MartialArtForm()
#         return HttpResponse(self.greeting)


def martial_art_detail(request, martial_art_pk):

    martial_art = get_object_or_404(MartialArt, pk=martial_art_pk)
    template_name = 'martial/martialart_detail.html'

    context = {'martialart': martial_art, 'style': 'old style function'}

    return render_to_response(template_name, context, RequestContext(request))


class MartialArtDetailView(DetailView):
    model = MartialArt

    def get_context_data(self, **kwargs):
        context = super(MartialArtDetailView, self).get_context_data(**kwargs)
        context['style'] = 'new cool CBV!'
        return context




# * C-r-u-d * #############################################


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


class AddView(CreateView):

    form_class = MartialArtForm

    def get(request, *args, **kwargs):
        print 'CBV: martial_art_add view GET :('
        raise Http404

    def form_valid(self, form):
        print 'CBV: martial_art_form is valid! :)'
        MartialArt.objects.create(**form.cleaned_data)
        return redirect(reverse('martial_arts_list_cbv'))

    def form_invalid(self, form):
        print 'CBV: martial_art_form is invalid! :('
        messages.error(self.request, u'Code form is invalid!')
        return HttpResponseRedirect(reverse('martial_arts_list_cbv'))


# class AddView(View):
#     form_class = MartialArtForm
#     # template_name = 'some_template.html'

#     def get(self, request):
#         print 'AddView GET request :('
#         # <view logic>
#         raise Http404

#     def post(self, request, *args, **kwargs):
#         print 'AddView POST request :)'
#         martial_art_form = self.form_class(request.POST)
#         if martial_art_form.is_valid():
#             print 'martial_art_form is valid! :)'
#             martial_art = martial_art_form.save(commit=False)
#             # martial_art.set_language()
#             martial_art.save()
#             martial_art_form = MartialArtForm()
#             print 'new form saved'
#         else:
#             print 'martial_art_form is invalid! :('
#             messages.error(request, u'Code form is invalid!')

#         # print 'Back to martial_arts_list view!'
#         # print reverse('martial_arts_list_cbv')
#         print type(reverse('martial_arts_list_cbv'))
#         return HttpResponseRedirect(reverse('martial_arts_list_cbv'))


# * c-r-U-d * #############################################


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


class MartialArtUpdateView(UpdateView, AjaxRequired, ProcessFormMixedResponseView, FormJsonValidMixin, FormJsonInvalidMixin):
    model = MartialArt
    context_object_name = 'martial_art'
    fields = ['title', 'hashtag', 'description', 'country']
    template_name = 'martial/edit.html'

    get_response_string = True

    msg_valid = 'Object is successfully changed'
    json_answer_valid = {'success': msg_valid}
    msg_invalid = 'The error occured while Object saving...'
    json_answer_invalid = {'error': msg_invalid}

    # template_name_suffix = '_update_form'

    def get_context_data(self, **kwargs):
        context = super(MartialArtUpdateView, self).get_context_data(**kwargs)
        # переопределили имя формы
        context['martial_art_form'] = context.pop('form')
        # ещё вариант - добавили новую форму в переменные шаблона
        # context['martial_art_form'] = self.get_form()
        # # в идеале - надо переопределить этот же метод у FormMixin, чтобы он
        # # добавлял кварг с другим именем потому что сейчас в шаблон передаётся
        # # две одинаковых переменных - наша и form
        return context


# * c-r-u-D * #############################################


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


class MartialArtDeleteView(DeleteView, AjaxRequired):
    model = MartialArt
    template_name = 'martial/confirm_delete.html'  # сюда попадаем при GET запросе к DeleteView
    # success_url = '/success/'

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        print 'CBV: Martial Art deleted :)'
        msg = u'Martial Art "%s" is successfully deleted' % self.object
        messages.success(request, msg)
        response = {'close': 'close modal'}
        print 'CBV: json response is ', response
        return JsonResponse(response)

    # # после того как мы переопределили метод delete из DeletionMixin,
    # дальнейшее перестало быть нам нужно
    # def get_success_url(self):
    #     return reverse('delete_success')


# # эта штука тоже теперь не нужна
def delete_success(request):
    msg = u'Martial Art is successfully deleted'
    messages.success(request, msg)
    answer = {
        'close': 'close modal'
        }
    # return render_to_response('martial/delete_success.html', {'martial_art_pk': martial_art_pk}, request)
    return JsonResponse(answer)


# #############################################


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class MartialArtViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = MartialArt.objects.all()
    serializer_class = MartialArtSerializer
