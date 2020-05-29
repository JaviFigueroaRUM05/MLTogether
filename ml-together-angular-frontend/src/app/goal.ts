export interface Goal {
  title: string;
  description: string;
  model: {
      modelFn: string;
      optimizer: string;
      loss: string[];
      metrics: string[];
  }  
  taskInfo: {
      trainingSetSize: number;
      batchSize: number;
      batchesPerReduce: number;
      trainDataUrl: string;
      mapFn: string;
      reduceFn: string;
  }
}
