# Docker Instructions

These instructions will guide you through the process of building and running the Docker container for the My Server application.

## Prerequisites

Make sure you have the following software installed on your system:

-   Docker ([Installation Guide](https://docs.docker.com/get-docker/))

## Build and the Docker Images

1. Open a terminal or command prompt.

2. Navigate to the root directory of the My Server project.

3. Build and run the Docker images by running the following command:

```bash
docker-compose up
```

### Setting up ports

You can change the ports in the docker-compose.yml file for the nodejs and nginx services.
Make sure the port for the nodejs service matches your .env.prod PORT variable.

## Port forwarding

Make sure to forward the ports for the NodeJs app as well as Nginx.
The port that the NodeJs app listens to is defined by the variable PORT in the .env.prod file.
The port that Nginx listens to is defined in the Nginx.conf file (default 8080).

## Sending requests

If everything is setup correctly, your should be able to send requests to your server by using the following request URL format: http://<YOUR_PUBLIC_IP>:<NGINX_LISTENING_PORT>/<ENDPOINT>
