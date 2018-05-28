# FB-Clone

## Install Docker

```bash
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

For more details on how to install Docker on Ubuntu 18.04, check
[this](https://linuxconfig.org/how-to-install-docker-on-ubuntu-18-04-bionic-beaver).

## Intall and run MariaDB

Install  MariaDB image:

```bash
docker pull mariadb:latest
```

Run the MariaDB server:

```bash
docker run --name fb-clone -e MYSQL_ROOT_PASSWORD=pw -d mariadb
```

To stop the MariaDB server (**DON'T DO THIS NOW**):

```bash
docker stop fb-clone
```

For more details, check [this](https://mariadb.com/kb/en/library/installing-and-using-mariadb-via-docker/).

## Create database and tables

Get into the container:

```bash
docker exec -it fb-clone bash
```

Get into the server:

```bash
mysql --user=root --password=pw
```

Copy the contents of  `/config/create.sql` and paste in the terminal.
It will create the database and tables.

## Set the app

```bash
npm install
npm install -g nodemon
```

## Run the app

On development:

```bash
npm start
```

On production:

```bash
npm build
npm serve
```