from django.apps import AppConfig


class IotConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "iot"

    def ready(self):
        import os
        # Avoid running MQTT loop during migrations or multiple workers
        if os.environ.get('RUN_MAIN') == 'true':
            from .mqtt import start_mqtt
            start_mqtt()
