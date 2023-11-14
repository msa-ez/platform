FROM node:14.10.0
WORKDIR /app
COPY package*.json /app/
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm install
COPY . /app
CMD ["npm", "run", "docker"]