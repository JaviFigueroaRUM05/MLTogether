FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y git curl wget gnupg make gcc g++

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs

COPY start.sh .

EXPOSE 3000

CMD ["bash", "start.sh"]
