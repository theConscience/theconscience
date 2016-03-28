import settings


def extension(request):
    """
    Adds extension-type context variables to the context.

    """
    return {'STATIC_EXT': settings.STATIC_EXT}


def concatenated(request):
    """
    Adds IS_CONCAT variable for extension-type and bundles including
    """
    return {'IS_CONCAT': settings.IS_CONCAT}
