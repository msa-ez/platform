FROM golang:1.17.2-alpine as builder
RUN apk add alpine-sdk
WORKDIR /go/app
COPY . .
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -o main -tags musl
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
FROM alpine:latest as runner
WORKDIR /root/
EXPOSE 8080
COPY --from=builder /go/app .
ENTRYPOINT ["/root/main", "-platform=Docker"]