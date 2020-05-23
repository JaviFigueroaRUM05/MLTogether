# Download base Ubuntu image
FROM ubuntu:18.04

# install basic tools
RUN apt-get update -y
RUN apt-get install -y vim git curl wget gnupg

# install node.js
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs 

COPY /ml-together-backend/package.json .

RUN npm install
EXPOSE 3000
CMD ["npm", "start"]

COPY /ml-together-backend .


