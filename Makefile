install:
	pip install -r requirements.txt

run:
	python app.py

test:
	pytest

lint:
	flake8 .

format:
	black .

type-check:
	mypy app.py

pre-commit-check:
	pre-commit run --all-files
