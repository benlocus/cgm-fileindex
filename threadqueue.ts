import AsyncThreadWorker from "./threadworker.ts"

interface Task<T> {
    value: T;
    resolve: (value: unknown) => void
    reject: (reason: any) => void
}

export class ThreadQueue<T> {
    public tasks: Array<Task<T>>;
    public max: number;
    public active: number;

    constructor(max: number) {
        this.tasks = [];
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
        if (this.active >= this.max) { // check and see if there are available threads
            return false;
        }

        const item = this.tasks.shift(); // pop off the front of the queue
        if (!item || item === undefined) return false; // make sure that there is an item

        try { // try and run the dequeue
            this.active++; // update the pending and active
            console.log(":: [Queue] Task started, active threads ↑ ", this.active)

            const thread = new AsyncThreadWorker.Thread(new URL('./workers/count_worker.ts', import.meta.url).href,)
            
            const promise = await thread.send_request(item?.value); // await the value (will be the value returned by the web workers)
            
            this.active--; // cleanup
            console.log(":: Task completed, active threads ↓ ", this.active)

            item.resolve(promise);
            
        } catch (error) { // catch any errors
            this.active--;
            
            item.reject(error)
            
        } finally { // recursively dequeue the next item in the Q

            this.dequeue();

        }

        return true;
    }
}

// testing section  
const auto_thread_queue = new ThreadQueue(10);

for (let i = 1; i <= 20; i++) {
    auto_thread_queue.enqueue("hello here is message: " + i)
}