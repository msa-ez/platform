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

# Running on Docker Compose (with Github)


### Register MSAez as a Github OAuth Application

You need github client id and secret before you run since MSAez needs to communicate with github.

1. Login to Github
2. Settings -> Developer settings -> OAuth Apps -> New OAuth App
3. Set Application Info
    - Application Name: MSAez * Required
    - Homepage URL: localhost:8080 ex) https://platform.uengine.org * Required
    - Application Description: Description
    - Authorization callback URL: localhost:5757/oauth2/mydb/signin ex) http://acebase.uengine.org/oauth2/mydb/signin

<img width="961" alt="스크린샷 2023-12-08 오후 12 39 58" src="https://github.com/msa-ez/platform/assets/487999/e6f9b235-2a46-47cd-86a6-a13ee97147ee">

Keep the note for client ID and Secret.


```sh
CLIENT_ID={{ Github OAuth Client ID }} \
CLIENT_SECRET={{ Github OAuth Client Secret }} \
docker-compose up -d
```

If you have domain name, give the domain name of DB_HOST:
```sh
DB_HOST={{ DB URL }} \
CLIENT_ID={{ Github OAuth Client ID }} \
CLIENT_SECRET={{ Github OAuth Client Secret }} \
docker-compose up -d
```


***
# Install MSAez on Kubernetes with GitLab

* Before the installation, register GitLab Application to get OAuth ID and Secrets.

### Install GitLab firstly
[Describe how to install gitlab on kubernetes]

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

5. Search for msa-ez in the search box and import the project.
![image](https://github.com/msa-ez/platform/assets/16382067/b78ed33b-cc92-40be-a793-e3c18079217a)

    - If nothing is found after searching msa-ez, you need to add msa-ez Organization from Github.


# Settings for AI-aided Model Generations by Chat GPT

#### Set Open AI token to the Database 
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
echo "[OPEN-AI-TOKEN]" | base64
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

