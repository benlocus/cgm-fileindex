interface Task<T> {
    value: T;
    resolve: (value: unknown) => void
    reject: (reason: any) => void
}

class Queue<T> {
    tasks: Array<T | Task<T>>;

    constructor() {
        this.tasks = [];
    }

    enqueue(task: T | Task<T>) {
        this.tasks.push(task);
    }

    dequeue(): T | Task<T> | undefined {
        return this.tasks.shift();
    }
}

export class ThreadQueue<T> extends Queue<T> {
    pending_promise: boolean;
    max_threads: number;
    active_threads: number;

    constructor(max_threads: number) {
        super(); // run the basic Queue constructor (set tasks to [])
        this.pending_promise = false; // init pending_promise to false
        this.max_threads = max_threads;
        this.active_threads = 0;
    }

    enqueue(value: T) {
        return new Promise((resolve, reject) => {
            super.enqueue({ value, resolve, reject }); // tasks.push(value)
            this.dequeue(); // run dequeue immediately
        });
    }

    async dequeue(): Promise<boolean | undefined> {
        if (this.pending_promise && this.active_threads >= this.max_threads) { // return early if the max threads are in use and there is outstanding work
            return false; // if there is an item currently running, return false
        } 
        const item = super.dequeue() as Task<T>; // get the item from the basic dequeue

        if (!item) return false; // if there is no item return false

        try {
            this.pending_promise = true; // set pending to true
            this.active_threads++;
            console.log("Job started, threads: ", this.active_threads)
            
            const payload = await item.value(this); // grab the value of the current item
            
            this.pending_promise = false; // set promise to false to show the job is done
            this.active_threads--;
            console.log("Job ended, threads: ", this.active_threads)

            item.resolve(payload); // resolve with the payload
        } catch (e) {
            this.pending_promise = false;

            item.reject(e);
        } finally {
            
            this.dequeue(); // this only runs if the process does not exit before it reaches here, which means that only the first item will be able to run more .dequeues()

        }

        return true;
    }
    



}
  
  // Helper function for 'fake' tasks
  // Returned Promise is wrapped! (tasks should not run right after initialization)
  const _ = ({ ms, ...foo } = {}) => () => new Promise(resolve => setTimeout(resolve, ms, foo));
  // ... create some fake tasks
  let p1 = _({ ms: 50, url: '❪𝟭❫', data: { w: 1 } });
  let p2 = _({ ms: 20, url: '❪𝟮❫', data: { x: 2 } });
  let p3 = _({ ms: 3000, url: '❪𝟯❫', data: { y: 3 } });
  let p4 = _({ ms: 30, url: '❪𝟰❫', data: { z: 4 } });
  let p5 = _({ ms: 50, url: '❪𝟭❫', data: { w: 1 } });
  let p6 = _({ ms: 20, url: '❪𝟮❫', data: { x: 2 } });
  let p7 = _({ ms: 3000, url: '❪𝟯❫', data: { y: 3 } });
  let p8 = _({ ms: 30, url: '❪𝟰❫', data: { z: 4 } });
  
  const aQueue = new ThreadQueue(2);
  const start = performance.now();
  
  aQueue.enqueue(p1).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); //          = 50
  aQueue.enqueue(p2).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 50 + 20  = 70
  aQueue.enqueue(p3).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 70 + 70  = 140
  aQueue.enqueue(p4).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
  aQueue.enqueue(p5).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
  aQueue.enqueue(p6).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
  aQueue.enqueue(p7).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170
  aQueue.enqueue(p8).then(({ url, data }) => console.log('%s DONE %fms', url, performance.now() - start)); // 140 + 30 = 170