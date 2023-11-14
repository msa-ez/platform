### Initialize token store firstly

- mysql
```
 docker exec -it infra-mysql-1 /bin/bash
 mysql --user=root --password=$MYSQL_ROOT_PASSWORD
 create database {{name}}_db;
```
