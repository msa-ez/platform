# MSAez (Microservices made easy) Platform

MSA Easy (https://www.msaez.io/) is a comprehensive tool designed to assist in the analysis, design, implementation, and operation of microservices. It enables business experts and developers to collaboratively analyze and design software using domain-driven design and event-storming techniques. Furthermore, it facilitates the automatic generation of the "Clean-code". Throughout this entire process, ChatGPT can provide automation support and guidance on how to effectively utilize this platform.

Chat-GPT creates User Stories

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/gptgif1.bd6740a.28dad45ee7b0e24b9f110f84bd82bc5e.gif">

Chat-GPT Auto Software Modeling (Event Storming and UML)

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/gptgif3.bd6740a.d7a8ffd811b78d6ce4a35790e79c9ae8.gif">

Code Generation & integrated with Cloud IDEs

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/ggd-6.775f9c8.ba2b625fcefc005fe38d439177ca5e57.gif">

Kubernetes Modeling and Git Deploy (Integrated with Argo)

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/image10.91ad02c.6a3dd0b490829b22cf18e381d27e1aaf.png">

Templates for major microservices platforms - Spring Boot, Axon, Go, Python

<img width="1286" alt="templates" src="https://github.com/msa-ez/platform/assets/487999/7d296274-059c-47f0-900e-794b93ba6817">

Toppings for Event driven Microservices Design Patterns including Saga, CQRS, Event sourcing, GraphQL, Token-based Authz/Authn, Circuit breaker, Microfrontends etc.

<img width="1288" alt="toppings" src="https://github.com/msa-ez/platform/assets/487999/44a821fe-5ab6-4f40-b106-78f3fb849c9d">

### User Guide

User-guide: https://intro.msaez.io/tool/google-drive-examples/#instructions

### Tutorial Videos

#### Google Docs Example

- (English) https://www.youtube.com/watch?v=MUN0iS3cJV8&list=PLEr96Fo5umW9w_5SmjXhOar1xRRWcZsbB&index=3
- (Korean) https://www.youtube.com/watch?v=GLT92wnRkMg

#### Axon Framework Example

- (English) Event sourcing and Choreography - https://www.youtube.com/watch?v=XoWd0QMue7A
- (English) Saga Orchestration- https://www.youtube.com/watch?v=0AEMNgtS5XU
- (Korean):
- part1: https://youtu.be/rFdBueV-JBs?t=2379
- part2: https://youtu.be/YGpUFRJwsuY
- part3: https://youtu.be/-nPsa4r2ceQ
- Background: https://youtu.be/rFdBueV-JBs

#### Multi-tenancy Support and Token-based Authn/Authz

- (Korean) https://www.youtube.com/watch?v=-D6PZldri2w

#### Mock Generation

- (Korean) https://www.youtube.com/watch?v=BlqwuMqI3J8

#### Unit Testing

- (Korean) https://www.youtube.com/watch?v=WF1fWdkFun0

#### ChatGPT based auto modeling

- (Korean) https://www.youtube.com/watch?v=liV2f5ZZlY0
- (Korean) https://www.youtube.com/watch?v=rUKFP6n-d68&list=PLEr96Fo5umW8CYIuf52d06BHfpgS6Q0-X&t=160s

#### ChatGPT based auto implementation & debugging

- (Korean) https://youtu.be/JuCN-bD7Jkk
- (English) https://youtu.be/yZMueAKEqwI

---

# Running on Docker Compose (with Github)

### Register MSAez as a Github OAuth Application

1. Login to Github
2. Settings -> Developer settings -> OAuth Apps -> New OAuth App
3. Set Application Info
   - Application Name: MSAez \* Required
   - Homepage URL: http://localhost:8080
   - Application Description: Description
   - Authorization callback URL: http://localhost:5757/oauth2/mydb/signin
4. Now you can find Github Application Client ID and Secret as follows:
   <img width="800" alt="image" src="https://github.com/msa-ez/platform/assets/487999/06f6af6e-6511-4a7f-a6d5-9021ca9b9d67">

Set those client ID and Secret with following command and run:

```sh
DB_HOST=localhost \
CLIENT_ID={{ Github OAuth Client ID }} \
CLIENT_SECRET={{ Github OAuth Client Secret }} \
docker-compose up -d
```

> If there's pull error please hit this: docker logout ghcr.io

Now you can navigate to localhost:8080

# Settings for AI-aided Model Generations by Chat GPT

To set Open AI token, we need to visit Acebase. Navigate to http://localhost:5757/webmanager/

Login with following info:

- DB Name: mydb
- User: admin
- Password: 75sdDSFg37w5

Set the Token encoded above in JSON format as shown below.

![image](https://github.com/msa-ez/platform/assets/16382067/6b6ae0c8-2f7b-4a15-9893-56f49e1e097c)

```
{ "tokens": {"openai": "BASE64-ENCODED-OPENAI-TOKEN"}}
```

\*\* Note: Your token must be encoded with base64:

```sh
echo "[OPEN-AI-TOKEN]" | base64
```

And Try to auto-generate Event-storming model with this guide: https://intro.msaez.io/tool/chat-gpt/#generating-business-model-utilizing-openai

---

# Setting Development Environment

```sh
# Set the version of npm(macOS)
npm install -g npm@6.14.18

nvm install 14
nvm use 14
npm install
```

### Run the frontend

create a file '/public/static/env.txt' and paste it:

```
VUE_APP_DB_HOST=localhost
VUE_APP_DB_PORT=5757
VUE_APP_DB_NAME=mydb
VUE_APP_MODE=onprem
VUE_APP_DB_HTTPS=false
VUE_APP_GIT=github
```

and run this script in the terminal:

```
npm run serve
```

Navigate to localhost:8080

### Run the Acebase DB

```
cd acebase

export CLIENT_ID=<Github OAuth Client ID>
export CLIENT_SECRET=<Github OAuth Secret>

node main.js
```

Navigate to the Acebase admin portal: localhost:5757

### Register Github App and Set the Open API tokens

[Describe here]

---

# Install MSAez on Docker Compose with Gitea

## Initialize MSAez

```sh
docker compose up -d
```

## Setting Gitea

### 1. Initialize Gitea

1. Access To http://127.0.0.1:3000/
2. Set Gitea Initial Configuration
3. **Administrator Account Setting**
4. Install Gitea

![alt text](https://github.com/user-attachments/assets/46aae576-9418-4765-924f-6e37ef5e0881)

### 2. Setting Gitea Configuration

1. Edit Gitea Configuration File

```ini
# ./gitea/gitea/conf/app.ini

# Add Cors Configuration
...
[cors]
ENABLED = true
ALLOW_DOMAIN = *

[server]
APP_DATA_PATH = /data/gitea
DOMAIN = gitea
SSH_DOMAIN = gitea
HTTP_PORT = 3000
# Edit ROOT_URL http://127.0.0.1:3000/ - >http://gitea:3000/
ROOT_URL = http://gitea:3000/
DISABLE_SSH = false
SSH_PORT = 22
SSH_LISTEN_PORT = 22
LFS_START_SERVER = true
LFS_JWT_SECRET = UPSh8CoIsH5nBiwg2kHeBWsKiIt97afTRSg0Jm2eeyA
OFFLINE_MODE = true
...
```

### 3. Setting OAuth2 Application with Gitea

1. Login to Gitea (Administrator)
2. Click **Profile Icon** (top right)
3. Click **Settings**
4. Click **Applications**
5. Input **Manage OAuth2 Applications**
   - Application Name : **any name** ex) acebase
   - Redirect URIs. Please use a new line for every URI.: **http://localhost:5757/oauth2/mydb/signin**
6. Click **Create Application**
7. **Client ID & Client Secret** issued after the registration of Application is necessary for MSAez Install, so save them.
   > ![alt text](https://github.com/user-attachments/assets/5b6c5038-1f29-4bcc-b70f-ed7fe004ee97)
8. Click **Save**

### 4. Setting Docker Compose Options

1.  Setting Acebase OAuth2 Client ID & Client Secret

```yml
# ./docker-compose.yaml
---
acebase:
  image: ghcr.io/msa-ez/acebase:v1.0.18 # Acebase Docker Image
  # image: sanghoon01/acebase:v1.1 # Acebase Docker Image
  container_name: acebase
  networks:
    - msaez
  ports:
    - 5757:5757
  volumes:
    - ./acebase/mydb.acebase:/acebase
  environment:
    DB_HOST: "0.0.0.0" # DB Host Name
    DB_NAME: mydb
    DB_PORT: 5757
    DB_HTTPS: "false"
    CLIENT_ID: 689a0fc9-a7af-4e67-8096-ad2d2b05db66 # OAuth Client ID
    CLIENT_SECRET: gto_uwrnodpkfxajmppgmcyislv7vdcsk53lxyaifkmoxczqncqzyi6q # OAuth Client Secret
    PROVIDER: gitea
    GIT: "gitea:3000" # Git URL
    PROTOCOL: http
```

### 6. Add Hosts File

```text
# /etc/hosts

127.0.0.1 gitea
```

### 7. Restart Docker Compose

```sh
docker compose down
docker compose up -d
```

### 8. Connect MSAez

> http://localhost:8080

---

# Install MSAez on Kubernetes with GitLab

- Before the installation, register GitLab Application to get OAuth ID and Secrets.

### Install GitLab firstly

[Gitlab Install Guide](https://docs.gitlab.com/charts/installation/)

### Register MSAez as a GitLab Application

1. Login to GitLab with Admin account
2. Admin Area -> Applications
   ![Pasted image 20231110122240](https://github.com/msa-ez/platform/assets/16382067/dd07d9bd-f524-4de8-9d6b-b9ad5550d792)
3. **Add New application Click**
4. Set Application
   ![Pasted image 20231110122407](https://github.com/msa-ez/platform/assets/16382067/d6657e15-fd76-4404-a71c-65673f8f3ebd)
5. ID & Secret issued after the registration of Application is necessary for MSAez Install, so save them. Application.

### Install MSAez

1. Installation of MSAez is running in on-prem-helm folder within the source code of \[MSAez SourceCode]\([https://github.com/msa-ez/platform](https://github.com/msa-ez/platform)).

```bash
$ git clone https://github.com/msa-ez/platform.git
```

---

2. Edit the value of Helm chart

```yaml
# /on-prem-helm/values.yaml
replicaCount: 1
image:
  repository: ghcr.io/msa-ez # Image Registry
  eventstorming: evenstorming:v1.0.7 # Eventstorming-tool Image URL
  acebase: acebase:v1.0.7 # Acebase Image URL

provider: github # github or gitlab

gitlab:
  url: gitlab.handymes.com # Gitlab URL

oauth:
  id: "" # Gitlab Application OAUTH ID
  secret: "" # Gitlab Application OAUTH Secrets

db:
  https: true
  host: acebase.handymes.com # DB URL
  port: 443 # fixed
  name: mydb # fixed
```

3. Install Helm.

```bash
$ cd on-prem-helm
$ helm install msaez .
```

4. Check the Service.

```bash
# Pod, Service
root@theia-build:/home/kimsanghoon$ kubectl get all
NAME                                     READY   STATUS    RESTARTS   AGE
pod/acebase-6c7c8598fd-6fgkp             1/1     Running   0          9d
pod/eventstorming-tool-8554ffc55-h94vd   1/1     Running   0          23h

NAME                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/acebase              ClusterIP   10.233.15.103   <none>        80/TCP    21d
service/eventstorming-tool   ClusterIP   10.233.19.127   <none>        80/TCP    21d

```

```bash
# Ingress
root@theia-build:/home/kimsanghoon$ kubectl get ing
NAME                     CLASS   HOSTS                  ADDRESS           PORTS     AGE
acebase                  nginx   acebase.handymes.com   000.000.000.000   80, 443   21d
eventstorming-tool-ing   nginx   msa.handymes.com       000.000.000.000   80, 443   21d
```

5. Register DNS or edit hosts file and login to the Host.

---

# Importing Code Templates to GitLab

## ※ The basic template must be created as a sub-project of a root account.

1. Select **New project**
   ![image](https://github.com/msa-ez/platform/assets/16382067/3b22928d-9457-430d-9619-5cf3d66f6ff1)

2. Select **import project**
   ![image](https://github.com/msa-ez/platform/assets/16382067/bc79990e-493c-41d1-a22b-1124639d0605)

3. Select GitHub
   ![image](https://github.com/msa-ez/platform/assets/16382067/acc6ced6-a85c-49b1-9d9f-f112a0a1eac8)

4. Enter Personal Access Token, then **Authenticate**
   ![image](https://github.com/msa-ez/platform/assets/16382067/b432aa46-d3c7-47e7-a1d4-69be70790c20)

- If you do not have a personal token, click GitHub **Personal Access Token** at the bottom to go to the Github token issuance screen.

5.  Search for msa-ez in the search box and import the project.
    ![image](https://github.com/msa-ez/platform/assets/16382067/b78ed33b-cc92-40be-a793-e3c18079217a)

        - If nothing is found after searching msa-ez, you need to add msa-ez Organization from Github.

# Roadmap

- Legacy Modernization:

Beginning with the input of existing legacy assets, like current codebases or database schemas, the tool identifies and extracts key Business Objects, such as Aggregates or Entities, and delineates APIs with their respective Commands.

After that, MSAez, takes the lead in creating a new, optimized model. This model is not only tailored to align with the modernized architectural design but is also primed for generating code that is compatible with cloud-native applications.

- Automated Coding, System Testing, and Code Debugging:

With the incorporation of ChatGPT, MSAez elevates its functionality by automating the implementation of business logic and test codes in the default generated code. Additionally, ChatGPT aids in automatically detecting and resolving bugs within the generated code, ensuring it successfully passes all necessary tests. This automation streamlines the coding and testing processes, significantly reducing the time and effort required for development and debugging.

- Integration with the Backstage Platform:

MSAez can be integrated as a plugin into the Backstage platform (https://backstage.io/ - a de-facto standard in developer portal platform), enabling BizDevOps professionals to consolidate various tools used throughout the Biz-Dev-Ops lifecycle. This integration allows for a seamless incorporation into Backstage's developer experience, enhancing workflow efficiency and tool management.
