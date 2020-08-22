'use strict';

/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const modelFn = `
const model = TF.sequential();
model.add(TF.layers.conv2d({
    inputShape: [28, 28, 1],
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    kernelInitializer:'glorotUniform'
}));
model.add(TF.layers.conv2d({
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    kernelInitializer:'glorotUniform'
}));
model.add(TF.layers.maxPooling2d({ poolSize: [2, 2] }));
model.add(TF.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: 'relu',
    kernelInitializer:'glorotUniform'
}));
model.add(TF.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: 'relu',
    kernelInitializer:'glorotUniform'
}));
model.add(TF.layers.maxPooling2d({ poolSize: [2, 2] }));
model.add(TF.layers.flatten());
model.add(TF.layers.dropout({ rate: 0.25 }));
model.add(TF.layers.dense({ units: 512, activation: 'relu', kernelInitializer:'glorotUniform' }));
model.add(TF.layers.dropout({ rate: 0.5 }));
model.add(TF.layers.dense({ units: 10, activation: 'softmax', kernelInitializer:'glorotUniform' }));
return model;
`;

module.exports = modelFn;



