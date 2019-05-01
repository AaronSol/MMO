class IntervalChain {
    constructor(finishedCallback, ...intervals) {
        this.intervalObj = intervals.shift();
        this.next = intervals.shift();

        this.start = function () {
            if (this.intervalObj) {
                let interval = setInterval(() => {
                    let keepGoing = this.intervalObj.callback();
                    if (!keepGoing) {
                        clearInterval(interval);
                        if (this.next) {
                            this.intervalObj = this.next;
                            this.next = intervals.shift();
                            this.start()
                        } else if (finishedCallback) finishedCallback()
                    }
                }, this.intervalObj.duration)
            }
        }
    }
}

class LoopingIntervalChain extends IntervalChain {
    constructor(finishedCallback, ...intervals) {

        let doLoop = () => {
            if (finishedCallback) finishedCallback();
            let intervals = [...this.intervals];
            this.intervalObj = intervals.shift();
            this.next = intervals.shift();
            this.start()
        };

        super(doLoop, ...intervals);
        this.intervals = [...intervals];

        this.stopLoop = function () {
            this.intervals = []
        }
    }
}

module.exports.IntervalChain = IntervalChain;
module.exports.LoopingIntervalChain = LoopingIntervalChain;
