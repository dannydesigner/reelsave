# Use Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies including ffmpeg
# NOTE: yt-dlp >=2026.6.9 requires Node.js v22+ or Deno for YouTube JS challenges.
# If upgrading yt-dlp past the pinned version, install one of these runtimes here.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p tmp

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
