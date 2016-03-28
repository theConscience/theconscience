import os
from collections import OrderedDict

from django.contrib.staticfiles.finders import AppDirectoriesFinder
from settings import PROJECT_APP

from django.apps import apps


class AppDirectoriesFinderExtra(AppDirectoriesFinder):
    """
    A static files finder that excludes static/ folder of main project app.
    """

    def __init__(self, app_names=None, *args, **kwargs):
        # The list of apps that are handled
        self.apps = []
        # Mapping of app names to storage instances
        self.storages = OrderedDict()
        app_configs = apps.get_app_configs()
        if app_names:
            app_names = set(app_names)
            app_configs = [ac for ac in app_configs if ac.name in app_names]
        for app_config in app_configs:
            if app_config.name != PROJECT_APP:
                app_storage = self.storage_class(
                    os.path.join(app_config.path, self.source_dir))
                if os.path.isdir(app_storage.location):
                    self.storages[app_config.name] = app_storage
                    if app_config.name not in self.apps:
                        self.apps.append(app_config.name)
        super(AppDirectoriesFinder, self).__init__(*args, **kwargs)