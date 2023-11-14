## 인증토큰을 얻는 방법  

## 1. postman 에서 확인
-- url 주소 POST
http://localhost:8090/oauth/token

Type : Basic Auth
Username : uengine-client
Password : uengine-secret

-- body 부분
grant_type : password
username : 4@4.com
password : password


## httpie 로 테스트
http --form POST localhost:8090/oauth/token \  
"Authorization: Basic dWVuZ2luZS1jbGllbnQ6dWVuZ2luZS1zZWNyZXQ=" \  
grant_type=password \  
username=1@uengine.org \  
password=1

http --form POST localhost:8090/oauth/token "Authorization: Basic dWVuZ2luZS1jbGllbnQ6dWVuZ2luZS1zZWNyZXQ=" grant_type=password username=1@uengine.org password=1

## jks 파일 생성 방법
https://www.lesstif.com/pages/viewpage.action?pageId=20775436  

