from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("asteroid/<str:nasa_id>/", views.asteroid_detail, name="asteroid_detail"),
]
