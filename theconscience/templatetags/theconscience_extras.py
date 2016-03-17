# -*- coding: utf-8 -*-

from django import template
# import datetime
# import re
# from datetime import timedelta
# from django.db.models import Q
# from django.core.cache import cache
# from django.utils.html import conditional_escape
# from django.utils.safestring import mark_safe
# from django.utils.translation import ugettext_lazy as _

register = template.Library()

# set custom dom attribute
@register.filter
def attr(form, name_arg):
    # case attr:'class=customclass customclass2 etc'
    try:
        attrs = form.field.widget.attrs
        name, arg = name_arg.split('=')
        attrs[name] = arg
        rendered = str(form)
    except:
        pass
    return form