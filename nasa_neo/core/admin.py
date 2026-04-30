from django.contrib import admin
from .models import Asteroid


@admin.register(Asteroid)
class AsteroidAdmin(admin.ModelAdmin):
    list_display = (
        "name", "close_approach_date", "diameter_avg_km",
        "velocity_kmh", "miss_distance_km", "is_potentially_hazardous",
    )
    list_filter = ("is_potentially_hazardous", "close_approach_date")
    search_fields = ("name", "nasa_id")
    readonly_fields = ("fetched_at",)
    ordering = ("-close_approach_date",)

    def diameter_avg_km(self, obj):
        return round(obj.diameter_avg_km, 4)
    diameter_avg_km.short_description = "Diametro medio (km)"
