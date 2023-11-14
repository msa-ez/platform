FROM webratio/nodejs-http-server

VOLUME /tmp
ADD dist /opt/www
ADD run.sh /opt/run.sh
ARG VUE_APP_API_HOST
ENV VUE_APP_API_HOST=$VUE_APP_API_HOST
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 8080
ENTRYPOINT ["sh","/opt/run.sh" ]