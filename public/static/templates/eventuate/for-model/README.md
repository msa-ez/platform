# {{name}}

## Model
www.msaez.io/{{URL}}

## Before Running Services
### Make sure there is a Infra running (kafka, mysql, cdc)
```
cd infra
docker-compose up
```
- Watch the MySQL messages:
```
docker exec -it infra-mysql-1 /bin/bash

mysql --user=root --password=$MYSQL_ROOT_PASSWORD
use eventuate;
select * from message;
```
- Watch the Kafka messages:
```
docker exec -it infra-kafka-1 /bin/bash
cd /bin

./kafka-console-consumer --bootstrap-server localhost:9092 --topic {{options.package}}.domain.{aggregate name}
```
> Aggregate Names:
{{#boundedContexts}}
{{#aggregates}}
- {{namePascalCase}}
{{/aggregates}}
{{/boundedContexts}}


## Run the backend micro-services
See the README.md files inside the each microservices directory:

{{#boundedContexts}}
- {{name}}
{{/boundedContexts}}


## Run API Gateway (Spring Gateway)
```
cd gateway
mvn spring-boot:run
```

## Test by API
{{#boundedContexts}}
- {{name}}
```
{{#aggregates}}
 http :8088/{{namePlural}} {{#aggregateRoot.fieldDescriptors}}{{name}}="{{name}}" {{/aggregateRoot.fieldDescriptors}}
{{/aggregates}}
```
{{/boundedContexts}}


## Run the frontend
```
cd frontend
npm i
npm run serve
```

## Test by UI
Open a browser to localhost:8088

## Required Utilities

- httpie (alternative for curl / POSTMAN) and network utils
```
sudo apt-get update
sudo apt-get install net-tools
sudo apt install iputils-ping
pip install httpie
```

- kubernetes utilities (kubectl)
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

- aws cli (aws)
```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

- eksctl 
```
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

