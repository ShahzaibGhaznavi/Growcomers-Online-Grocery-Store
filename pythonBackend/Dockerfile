FROM python:3.11-slim

WORKDIR /app

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NLTK_DATA=/root/nltk_data

COPY requirements.txt .

RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r requirements.txt \
    && rm -rf \
       /usr/local/lib/python3.11/site-packages/pip \
       /usr/local/lib/python3.11/site-packages/pip-*.dist-info \
       /usr/local/bin/pip \
       /usr/local/bin/pip3 \
       /usr/local/bin/pip3.11

RUN python -c "import nltk; resources = ['punkt_tab', 'punkt', 'wordnet', 'averaged_perceptron_tagger_eng']; [nltk.download(resource, download_dir='/root/nltk_data', quiet=True, raise_on_error=True) for resource in resources]"

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]