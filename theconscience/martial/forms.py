# -*- coding: utf-8 -*-
from django import forms
from martial.models import MartialArt
from django.utils.translation import get_language, ugettext_lazy as _


class MartialArtForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(MartialArtForm, self).__init__(*args, **kwargs)

    class Meta:
        model = MartialArt
        fields = ('title','hashtag','description','country')
        '''
        widgets = {
            'name_ru': forms.TextInput(attrs={'class':'special'}),
            'name_en': forms.TextInput(attrs={'class':'special'}),
        }
        '''

    def clean(self):
        self.cleaned_data = super(MartialArtForm, self).clean()
        return self.cleaned_data