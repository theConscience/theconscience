from django.shortcuts import render
from django.http import HttpResponseRedirect, Http404, HttpResponse, JsonResponse

# Create your views here.


def index(request):
    return HttpResponse('Hello world')
