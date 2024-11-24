# Use the official Python 3.13 base image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies (including curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy project files into the container
COPY . .

# Install dependencies using Poetry
RUN poetry install --no-dev

# Expose the application port (e.g., 5000 for Flask)
EXPOSE 5000

# Run the app
CMD ["poetry", "run", "python", "app.py"]
