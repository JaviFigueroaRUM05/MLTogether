# MLTogether Backend


## Directory Structure

* **server**: server configuration and initialization
* **lib**: REST API for projects
* **task**: Task Broker functionality
* **test**: Tests for MLTogether
  * **mnist-test**: Test for training mnist

## How to use

Before one can use this backend, first you need an instance of RabbitMQ running on your machine locally. If you wish to use a remote instance of RabbitMQ, you must change the configuration settings in the code. This service can be easily setup by starting a docker containing RabbitMQ. More on that [here](https://hub.docker.com/_/rabbitmq).

Afterwards, make sure you run `npm install` on this directory to install all of the dependencies.


