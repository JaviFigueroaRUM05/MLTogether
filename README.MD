# How to use the MNIST test

First do npm install on both ml-together-backend and ml-together-frontend.

Remember to have an instance of MongoDB running and RabbitMQ

Afterwards, go to ml-together-backend/test/e2e/mnist-test/server and run node index.js

In another terminal, go to ml-together-backend/test/e2e/mnist-test/test-initializer and run node runner.js

This is to initialize all of the tasks.

Then, with that same terminal or other one, go to ml-together-frontend and run npx webpack --config webpack.config.js .

Install globaly http-server package by doing npm i -g http-server 

Finally navigate to ml-together-frontend/dist/ and run http-server -c 1 --cors

