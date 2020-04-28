'use strict';

const Initializer = require('./index');
const PROJECT_ID = 'mnist121';
const MODEL_HOST = 'http://localhost:3000/projects/' + PROJECT_ID + '/ir';

Initializer.initialize(PROJECT_ID, MODEL_HOST);