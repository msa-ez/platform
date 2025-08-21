# Install Script
```shell script
helm install on-prem . 
```

# Values
# Default values for on-prem-helm.
# This is a YAML-formatted file. 
# Declare variables to be passed into your templates.

replicaCount: 1

image:
  repository: "gcr.io/eventstorming-tool/eventstorming-ui-onprem"
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: "0.1"

clusterAddress:
db:
  host: www.msastudy.io
  port: 5757
  name: mydb
nameOverride: ""
fullnameOverride: ""
podAnnotations: {}
podSecurityContext: {}
securityContext: {}
service:
  type: ClusterIP
  port: 80
resources: {}
nodeSelector: {}
tolerations: []
affinity: {}

hosts:
  domain: msastudy.io

gitlab:
  certmanager-issuer:
    email: sanghoon01@uengine.org
  global:
    hosts:
      domain: msastudy.io
  redis:
    imagePullSecrets: []

# 이후 설치
## Issuer

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: onprem-issuer
  namespace: default
  resourceVersion: "186159"
  uid: 160c31a8-b3fe-4c2b-b240-35b5db266194
spec:
  acme:
    email: help@uengine.org
    preferredChain: ""
    privateKeySecretRef:
      name: letsencrypt-prod
    server: https://acme-v02.api.letsencrypt.org/directory
    solvers:
    - dns01:
        route53: # AWS Route53 기준임
          accessKeyID: AKIA6H47RAWMQ6QFLRNS # IAM KEY
          region: us-east-1
          role: arn:aws:iam::979050235289:role/cert-manager
          secretAccessKeySecretRef: # IAM SECRET
            key: secretAccessKey
            name: aws-access-key
      selector:
        dnsZones:
        - "uengine.solutions"
```
Issuer를 등록해야 정상작동하는데 Issuer라는 ResourceType 이 Gitlab 설치 이후에 동작하므로..
순서성에 관련해서 어떻게 할 수 있는지 확인 필요함. 

## Deployment 관련 설정 변경
1. kubectl describe secret default
1. API-Server
```yaml
...
      - env:
        - name: API_SERVER_URL
          value: https://34.64.148.177 # Cluster 경로
        - name: API_SERVER_TOKEN # Default Token - Admin 권한
          value: eyJhbGciOiJSUzI1NiIsImtpZCI6IkEtQXFtaV9WVXV6OUc1bzA1cm9ZZGY0b2xGc3RmMGQzakFJUFVjUldGd0EifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4td2w1NHAiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjJkYjZlMzMwLWU2YWQtNDE3MS04YWQ0LTlkMmQ1ZmI3YzZmYiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.lzlCBfkbpdyxr83_XHtSB3W3ZJ6UWAGxKJyTX6FUnlPnB--3WZI8X0elHZL21TmOwJq8PCAdg3pUCvJIVtmoyW-XGhp8y7C1VjF3oIPc7BfyMyYeu5LGpuOfgRwjRjpFRJyHx2b93QDkptcFz8-uyKhP-kNPNbeLWnbCJ5AzxxbzjNRZYWH0OT0dC9zpun35VeYWkVUMialOixMtl5PJ13PudVOzc0ZQN-Ty61vD8O-HxV4faIz_tRrBSxx8W1RGO2h2wRpILV26KIvD_m9w8it_GJ24KvAP3FTnsnpEQ2urljbxQFjZWC3bjJrrQg41bTVUxuRdzPakEQ-fTvt0eg
        - name: API_SERVER_MAXIMUM
          value: "999" # Cluster에 배포될 최대 IDE 갯수
...
```

2. eventstorming-ui
```yaml
...
    spec:
      containers:
      - env:
        - name: VUE_APP_DB_HOST
          value: acebase.msastudy.io # Acebase Domain Address
        - name: VUE_APP_DB_PORT
          value: "443" # https 처리를 해야하므로 고정
        - name: VUE_APP_DB_NAME
          value: mydb # Database Name
        - name: VUE_APP_MODE
          value: onprem # onprem - Use Acebase 
        - name: VUE_APP_CLUSTER_ADDRESS
          value: https://34.64.148.177 # IDE 배포 될 Cluster의 IP
...

```
# shell script
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

```
## Operator 설치
```shell script
make deploy IMG=gcr.io/eventstorming-tool/theia-ide-lab:v137
```


route53

*.msastudy.io
    -> IDE
    
www.msastudy.io
    -> UI

# PVC
```
AWS - 
    EFS
    PVC    
```

```
GCP - 
    NFS-Server 
    DISK -> NFS -> PV -> PVC -> POD.....
```
