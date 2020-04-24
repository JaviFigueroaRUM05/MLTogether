class Worker {
    constructor(id) {
        this.id = id;
        this.currentJob = {};
        this.complitedJobs = 0;
    }
}

module.exports = { Worker };