const Nes = require('nes');

var client = new Nes.Client('ws://localhost:3000');

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
    payload = await client.request('/project/next');
    payload = JSON.parse(payload.payload)
    if      (payload.function == "map")    { result = { result: map(payload.data) }; }
    else if (payload.function == "reduce") { result = { result: reduce(payload.data) }; }
    else if (payload.function == "nop")    { result = { result: "nop" }; }
    else                                   { console.log("Function: " + payload.function + " is Invalid."); process.exit(1); }
    return result;
};

const return_result = async (result) => { // Returns results to the server
    await client.message(JSON.stringify(result));
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