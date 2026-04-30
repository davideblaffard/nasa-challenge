import json
from datetime import date, timedelta

from django.shortcuts import get_object_or_404, render
from django.utils import timezone

from .models import Asteroid
from .services import fetch_and_cache


def dashboard(request):
    today = date.today()
    default_start = today - timedelta(days=6)

    start_str = request.GET.get("start_date", default_start.isoformat())
    end_str = request.GET.get("end_date", today.isoformat())

    error = None
    asteroids = []

    try:
        start_date = date.fromisoformat(start_str)
        end_date = date.fromisoformat(end_str)
        if (end_date - start_date).days > 30:
            error = "Intervallo massimo consentito: 30 giorni."
        elif start_date > end_date:
            error = "La data di inizio deve precedere la data di fine."
        else:
            asteroids = fetch_and_cache(start_date, end_date)
    except ValueError:
        error = "Formato data non valido. Usa YYYY-MM-DD."

    hazardous_count = sum(1 for a in asteroids if a.is_potentially_hazardous)

    # Chart.js data
    chart_labels = [a.name for a in asteroids]
    chart_diameters = [round(a.diameter_avg_m, 2) for a in asteroids]
    chart_hazardous = [a.is_potentially_hazardous for a in asteroids]

    context = {
        "asteroids": asteroids,
        "start_date": start_str,
        "end_date": end_str,
        "error": error,
        "total_count": len(asteroids),
        "hazardous_count": hazardous_count,
        "chart_labels": json.dumps(chart_labels),
        "chart_diameters": json.dumps(chart_diameters),
        "chart_hazardous": json.dumps(chart_hazardous),
    }
    return render(request, "core/dashboard.html", context)


def asteroid_detail(request, nasa_id):
    asteroid = get_object_or_404(Asteroid, nasa_id=nasa_id)
    return render(request, "core/asteroid_detail.html", {"asteroid": asteroid})
