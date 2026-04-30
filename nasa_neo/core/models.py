from django.db import models


class Asteroid(models.Model):
    nasa_id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=255)
    close_approach_date = models.DateField(db_index=True)
    diameter_min_km = models.FloatField()
    diameter_max_km = models.FloatField()
    velocity_kmh = models.FloatField()
    miss_distance_km = models.FloatField()
    is_potentially_hazardous = models.BooleanField(default=False)
    absolute_magnitude = models.FloatField(null=True, blank=True)
    nasa_url = models.URLField(blank=True)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["close_approach_date", "name"]
        indexes = [
            models.Index(fields=["close_approach_date", "is_potentially_hazardous"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.close_approach_date})"

    @property
    def diameter_avg_km(self):
        return (self.diameter_min_km + self.diameter_max_km) / 2

    @property
    def diameter_avg_m(self):
        return self.diameter_avg_km * 1000
