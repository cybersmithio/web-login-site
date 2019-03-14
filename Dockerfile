### START OF DOCKERFILE FROM Node Jessie 10.6.0 build
### https://github.com/nodejs/docker-node/blob/master/10/jessie/Dockerfile
FROM node

COPY html /usr/src/app

RUN cd /usr/src/app; npm install

EXPOSE 443

WORKDIR /usr/src/app

CMD node web-login-site.js