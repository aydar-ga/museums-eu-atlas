install:
	poetry install

run:
	poetry run python app.py

test:
	poetry run pytest

lint:
	poetry run flake8 .

format:
	poetry run black .

type-check:
	poetry run mypy app.py

pre-commit-check:
	poetry run pre-commit run --all-files
