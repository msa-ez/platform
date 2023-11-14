FROM python:3.7.3
COPY . /app
WORKDIR /app

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
CMD ["python3", "app.py", "-m", "Docker"]
