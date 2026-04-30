from datetime import date, timedelta

from django.core.management.base import BaseCommand, CommandError

from nasa_neo.core.services import fetch_and_cache


class Command(BaseCommand):
    help = "Popola il DB con dati asteroidi da NASA NeoWS API."

    def add_arguments(self, parser):
        today = date.today()
        parser.add_argument(
            "--start-date",
            type=str,
            default=(today - timedelta(days=6)).isoformat(),
            help="Data inizio (YYYY-MM-DD). Default: 7 giorni fa.",
        )
        parser.add_argument(
            "--end-date",
            type=str,
            default=today.isoformat(),
            help="Data fine (YYYY-MM-DD). Default: oggi.",
        )

    def handle(self, *args, **options):
        try:
            start_date = date.fromisoformat(options["start_date"])
            end_date = date.fromisoformat(options["end_date"])
        except ValueError as exc:
            raise CommandError(f"Formato data non valido: {exc}") from exc

        if start_date > end_date:
            raise CommandError("start_date deve precedere end_date.")

        self.stdout.write(
            self.style.NOTICE(
                f"Fetching asteroidi da {start_date} a {end_date}..."
            )
        )

        asteroids = fetch_and_cache(start_date, end_date)

        hazardous = sum(1 for a in asteroids if a.is_potentially_hazardous)
        self.stdout.write(
            self.style.SUCCESS(
                f"Completato. {len(asteroids)} asteroidi nel range "
                f"({hazardous} potenzialmente pericolosi)."
            )
        )
