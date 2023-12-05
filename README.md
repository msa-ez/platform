# MSAez Platform Core

### Project setup

```sh
# Set the version of npm(macOS)
npm install -g npm@6.14.18

nvm install 14
nvm use 14
npm install
```
### Compiles and hot-reloads for development

```
npm run serve
```


***

# Install MSAez on Docker Compose

### Q1. What is Docker Compose? A management tool that provides a work environment where multiple containers can be defined as one service on a single server and managed as a bundle. 
### Q2. Why do we use Docker Compose? When multiple containers operate as one application, it operates by reading files that define their options and environment to create containers sequentially. It is good to use Docker Compose as the number of containers increases and the options to be defined increase.

1. Build a project with Npm.

```sh
npm run build
```

2. Push an image of MSAez to Docker server. 

```sh
# Project Root
# registry-name, image-name and image-tag must be customed personally.
docker build -t registry/image-name:image-tag . # Same concept as 'tag numbering'.
docker push registry/image-name:image-tag # Same concept as 'tags push'.
```

3. Push an image of Acebase to Docker server. 

```sh
# Project Root
cd acebase
docker build -t registry/image-name:image-tag . 
docker push registry/image-name:image-tag 
```

4. Edit Docker Compose File.

```yaml
version: '2'
services:
   msaez:
    image: ghcr.io/msa-ez/platform:v1.0.7 # MSAez Docker Image
    ports:
      - 8080:8080
    environment:
      VUE_APP_DB_HOST: 5757-msaez-platform-kp3ioeesr8g.ws-us106.gitpod.io # DB Host Name
      VUE_APP_DB_PORT: 5757 # DB Port
      VUE_APP_DB_NAME: mydb # DB NAME
      VUE_APP_MODE: onprem # MODE onprem or dev
      VUE_APP_HTTPS: true # MODE onprem or dev
      VUE_APP_GITLAB: # Gitlab URL
  acebase :
    image: ghcr.io/msa-ez/acebase:v1.0.7 # Acebase Docker Image
    container_name: acebase
    ports:
      - 5757:5757
    volumes:
      - ~/mydb.acebase:/acebase
    environment:
      DB_HOST: 5757-msaez-platform-kp3ioeesr8g.ws-us106.gitpod.io # DB Host Name
      DB_NAME: mydb
      DB_PORT: 80
      DB_HTTPS: true
      CLIENT_ID: # Application Key
      CLIENT_SECRET: # Application Secrets
      PROVIDER: "github"
      GITLAB: "" # Gitlab URL
```

5. Run Docker Compose

```sh
docker compose up -d
```

***
# Install MSAez on Kubernetes

### Q1. What is Kubernetes? Kubernetes is an open source container orchestration platform that automates many of the manual processes involved in deploying, managing, and scaling containerized applications.
### Q2. Why do we use Kubernetes? Kubernetes helps deliver and manage containerized legacy and cloud apps, as well as apps refactored into microservices, and its orchestration management capabilities make development faster and existing applications easier to transform and optimize.

* Before the installation, register GitLab Application to get OAuth ID and Secrets.

### Register GitLab Application

1. Login to GitLab with Admin account 
2. Admin Area -> Applications
![Pasted image 20231110122240](https://github.com/msa-ez/platform/assets/16382067/dd07d9bd-f524-4de8-9d6b-b9ad5550d792)
3. **Add New application Click**
4. Set Application 
![Pasted image 20231110122407](https://github.com/msa-ez/platform/assets/16382067/d6657e15-fd76-4404-a71c-65673f8f3ebd)
5. ID & Secret issued after the registration of Application is necessary for MSAez Install, so save them. Application. 

### Register Github OAuth Application
1. Login to Github
2. Settings -> Developer settings -> OAuth Apps -> New OAuth App
![image](https://github.com/msa-ez/platform/assets/16382067/bfe19316-3b31-4573-b83f-e0e651b11ee0)
3. Set Application Info
    - Application Name: ${Application Name} * Required
    - Homepage URL: Platform URL ex) https://platform.uengine.org * Required
    - Application Description: Description
    - Authorization callback URL: ${Acebase DB URL}/oauth2/mydb/signin ex) http://acebase.uengine.org/oauth2/mydb/signin

### Install MSAez

1. Installation of MSAez is running in on-prem-helm folder within the source code of \[MSAez SourceCode]\([https://github.com/msa-ez/platform](https://github.com/msa-ez/platform)). 

```bash
$ git clone https://github.com/msa-ez/platform.git
```

***

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

***
# Setting for Chat GPT-related functions

#### FYI 
> [Acebase](https://github.com/appy-one/acebase)

1. Set in main.js inside the acebase folder.
   Set each options as a comment.
   
```js
// main.js
...
const host = process.env.DB_HOST;
const dbname = process.env.DB_NAME ? process.env.DB_NAME : "mydb"; // DB Name
const server = new AceBaseServer(dbname, {
    host: host ? host : "localhost", // Acebase Use Domain (allow all 0.0.0.0)
    port: 5757,
    storage: {
        path: "/acebase" // DB File Path
    },
    authentication: {
        enabled: true,
        allowUserSignup: true,
        defaultAccessRule: "auth",
        defaultAdminPassword: {{ password }}, // Admin Password 
    },
});
server.on("ready", () => {
    console.log("SERVER ready");
});
const db = new AceBaseClient({
    host: host ? host : "localhost", // Acebase DB URL
    port: '5757', // If SSL is processed in Ingeress : 443
    dbname: dbname, 
    https: false, // If SSL is processed in Ingeress : True
});

  // Set password from the setting above. 
db.auth.signIn("admin", {{ password }} ).then((result) => {
    console.log(
        `Signed in as ${result.user.username}, got access token ${result.accessToken}`
    );
});

...
```
***
#### Acebase Administrator Login Page
![image](https://github.com/msa-ez/platform/assets/16382067/477d0662-f07c-4db5-8a65-62ab13a1dde5)

Enter the information from the setting above.
> Database name : {{ dbname }}
> Username : admin (fixed)
> Password : {{ password }}
#### Acebase Login Page
![[Pasted image 20231120162428.png]]
After login, check the data inside.

#### Add & edit Acebase data
> ex) How to put in Token for OpenAI
1. Click **update** from the message "**You can update this node or export the value of this node to json**" at the bottom.
2. Check is the textbox as below is added after click.
![[Pasted image 20231120162938.png]]
3. Data can only be entered in Json format and is encoded in base64 after issuing an OpenAI Token.
##### Linux or MacOS
```sh
echo "token" | base64
```
##### Windows (CMD and PowerShell)
> CMD
```cmd
powershell "[convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(\"Token!\"))"
```

> Powershell
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes("Token!"))
```

4. Enter the Token encoded above in JSON format as shown below.
> Token Path : /tokens/openai

> Result
```json
{
  "tokens": {
    "openai": "encoded token!"
  }
}
```

5. Enter the JSON created above into the TextBox and click update.

> Before : ![[Pasted image 20231120170329.png]]

> After : ![image](https://github.com/msa-ez/platform/assets/16382067/6b6ae0c8-2f7b-4a15-9893-56f49e1e097c)

Tokens are added as shown in the picture above.

***
# GitLab Template Import

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

5. Search for msa-ez in the search box and import the project.
![image](https://github.com/msa-ez/platform/assets/16382067/b78ed33b-cc92-40be-a793-e3c18079217a)

    - If nothing is found after searching msa-ez, you need to add msa-ez Organization from Github.
