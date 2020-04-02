const Nes = require('nes');

var client = new Nes.Client('ws://localhost:3000');

//TODO: fix params, move function 
async function initializeTasks(projectData){
    //sample project data
      projectData = {
        url : 'http://example.com/data',
        chunkSize: 2,
        dataLength: 5
      }
    
    let chunk = Math.floor(projectData.dataLength/projectData.chunkSize);
    let lowerBound = 0;
    let UpperBound = projectData.chunkSize-1;
  
      for (let i = 0; i <chunk; i++){
        let dataLocation = new URL (projectData.url);
        //adds query parameters
        dataLocation.searchParams.set('lowerBound',lowerBound);
        dataLocation.searchParams.set('upperBound',UpperBound);
        //task to be pushed queue
        let task = { 
          function: "map",
          data: dataLocation
        }
      //to fetch actual data from api, not done in this function  
      //  const { res, payload } = await Wreck.get(projectData.url);
      //  let result = await payload;
        console.log(task)
        lowerBound = UpperBound + 1;
        UpperBound = UpperBound + projectData.chunkSize;
      }
      if ( Number(projectData.dataLength%projectData.chunkSize)>Number(0)){
        //uneven chunk
        let dataLocation = new URL (projectData.url);
        //task to be pushed to queue
        //task to be pushed queue
        dataLocation.searchParams.set('lowerBound',lowerBound);
        dataLocation.searchParams.set('upperBound',projectData.dataLength-1);
          let task = { 
            function: "map",
            data: dataLocation
          }
          console.log(task)
        
      }
    
  }
  

// Map-Reduce Functions
const map = (n) => { // Map = factorial(n)
    var result = 1;
    if (n == 0) { return result; }
    for (var i = 1; i <= n; i += 1) {
        result *= i;
    }
    return result;
}

const reduce = (n) => { // Reduce = fibonacci(n)
    if (n == 0) { return 0; }
    if (n == 1) { return 1; }
    return reduce(n-1) + reduce(n-2)
}

// Helper Functions
const next_task = async () => { // Asks Task Broker for next task
    var payload, result;
    payload = await client.message(JSON.stringify({ event: "next" }));
    console.log('Working')
    payload = JSON.parse(payload.payload)
    if      (payload.function == "map")    { result = { result: map(payload.data) }; }
    else if (payload.function == "reduce") { result = { result: reduce(payload.data) }; }
    else if (payload.function == "nop")    { result = { result: "nop" }; }
    else                                   { console.log("Function: " + payload.function + " is Invalid."); process.exit(1); }
    return result;
};

const return_result = async (result) => { // Returns results to the server
    await client.message(JSON.stringify({ event: "result", result: result }));
};

// Main
const main = async () => {
    await client.connect();

    while (true) {
        var result = await next_task();
        if (result.result == "nop") { break; }
        await return_result(result);
    }
    
    await client.disconnect();
};
main();