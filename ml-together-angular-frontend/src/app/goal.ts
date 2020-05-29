export interface Goal {
  id: number;
  title: string;
  description: string;
  model: {
      modelfn: string;
      optimizer: string;
      loss: string;
      metrics: string;
  }  
  taskInfo: {
      tsize: number;
      bsize: number;
      bperReduce: number;
      turl: string;
      mapfn: string;
      reducefn: string;
  }
}
