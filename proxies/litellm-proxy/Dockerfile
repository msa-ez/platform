FROM python:3.11-slim

WORKDIR /app

RUN pip install 'litellm[proxy]'

COPY config.yaml .

EXPOSE 4000

CMD ["litellm", "--config", "/app/config.yaml", "--host", "0.0.0.0"]