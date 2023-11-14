## How to run

- Run axon server firstly

You need the Axon server to run this application.
You can download the Axon server from below url:
https://axoniq.io/download  


```
cd axon-server
java -jar axonserver-4.3.5.jar
```

axon server UI  
http://localhost:8024  

or You can run the axon server with docker:

```
docker run -d --name my-axon-server -p 8024:8024 -p 8124:8124 axoniq/axonserver
```

