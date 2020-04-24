class Worker {
    constructor(id) {
        this.id = id;
        this.currentJob = {};
        this.completedJobs = 0;
    }
}

module.exports = { Worker };