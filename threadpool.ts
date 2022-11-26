interface Task<T> {
    value: T;
    resolve: (value: unknown) => void
    reject: (reason: any) => void
}

export class ThreadQueue<T> {
    public tasks: Array<Task<T>>;
    private pending: boolean; // internal use only
    public max: number;
    public active: number;

    constructor(max: number) {
        this.tasks = [];
        this.pending = false;
        this.max = max;
        this.active = 0;
    }

    enqueue(value: T): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.tasks.push({ value, resolve, reject })
            this.dequeue(); // run dequeue immediately upon queueing
        })
    }

    async dequeue(): Promise<boolean> {
        if (this.pending && (this.active >= this.max)) { // check and see if there are available threads
            return false;
        }

        const item = this.tasks.shift(); // pop off the front of the queue
        if (!item) return false; // make sure that there is an item

        try { // try and run the dequeue
            this.pending = true; this.active++; // update the pending and active
            console.log(":: Task started, active threads ↑ ", this.active)
            
            const payload = this.tasks.shift()
            const promise = await thread_task(payload?.value); // await the value (will be the value returned by the web workers)
            
            this.pending = false; this.active--; // cleanup
            console.log(":: Task completed, active threads ↓ ", this.active)

            item.resolve(promise);
            
        } catch (error) { // catch any errors
            this.pending = false;
            
            item.reject(error)
            
        } finally { // recursively dequeue the next item in the Q

            this.dequeue();

        }

        return true;
    }
}

const thread_task = <T>(payload: T) => {
    return new Promise((resolve) => {
        console.log(':: New Worker Spinning')
        const worker = new Worker(new URL("./workers/count_worker.ts", import.meta.url).href, {
            type: "module",
        });
        worker.postMessage({ number: 1000000000, data: payload });

        worker.onmessage = (e: MessageEvent) => {
            console.log(":: Message received from worker")
            resolve("done here")
        }
    })
}

// // Helper function for 'fake' tasks
//   // Returned Promise is wrapped! (tasks should not run right after initialization)
//   const _ = ({ ms, ...foo } = {}) => () => new Promise(resolve => setTimeout(resolve, ms, foo));
//   // ... create some fake tasks
//   let p1 = _({ ms: 50, url: '❪𝟭❫', data: { w: 1 } });
//   let p2 = _({ ms: 20, url: '❪𝟮❫', data: { x: 2 } });
//   let p3 = _({ ms: 3000, url: '❪𝟯❫', data: { y: 3 } });
//   let p4 = _({ ms: 30, url: '❪𝟰❫', data: { z: 4 } });
//   let p5 = _({ ms: 50, url: '❪𝟭❫', data: { w: 1 } });
//   let p6 = _({ ms: 20, url: '❪𝟮❫', data: { x: 2 } });
//   let p7 = _({ ms: 6000, url: '❪𝟯❫', data: { y: 3 } });
//   let p8 = _({ ms: 30, url: '❪𝟰❫', data: { z: 4 } });
  
  const aQueue = new ThreadQueue(2);
    aQueue.enqueue("hello here is a message")
    aQueue.enqueue("hello here is a message")
    aQueue.enqueue("hello here is a message")
    aQueue.enqueue("hello here is a message")

//   const start = performance.now();
  
//   aQueue.enqueue(p1).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); //          = 50
//   aQueue.enqueue(p2).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 50 + 20  = 70
//   aQueue.enqueue(p3).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 70 + 70  = 140
//   aQueue.enqueue(p4).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
//   aQueue.enqueue(p5).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
//   aQueue.enqueue(p6).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
//   aQueue.enqueue(p7).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
//   aQueue.enqueue(p8).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170