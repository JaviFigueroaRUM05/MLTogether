# Download base Ubuntu image
FROM ubuntu:18.04

# install basic tools
RUN apt-get update -y
RUN apt-get install -y vim git curl wget gnupg

# install node.js
RUN curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
RUN apt-get install -y nodejs 

# install rabbitmq
RUN curl -fsSL https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | sudo apt-key add -
RUN apt-get install  apt-transport-https
RUN tee /etc/apt/sources.list.d/bintray.rabbitmq.list <<EOF
RUN deb https://dl.bintray.com/rabbitmq-erlang/debian bionic erlang
RUN deb https://dl.bintray.com/rabbitmq/debian bionic main
RUN EOF

RUN apt-get update -y
RUN apt-get install rabbitmq-server -y --fix-missing

# install mongodb
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
RUN apt-get update -y
RUN apt-get install -y mongodb-org

# start services
RUN systemctl start mongod
RUN systemctl start rabbitmq-server

# download server code
RUN git clone https://github.com/JaviFigueroaRUM05/MLTogether.git

# setup ans start server
RUN cd MLTogether/ml-together-backend
RUN npm install
RUN npm start

