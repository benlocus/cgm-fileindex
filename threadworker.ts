// this is the actual web worker that will live in its own file
class ThreadWorker {
    worker: Worker

    constructor(self: Worker) {
        this.worker = self // set the environmnet of the web worker as a property on the class
        self.onmessage = (e: MessageEvent) => this.on_message(e);
    }

    on_message(e: MessageEvent) { // this method catches the worker message and passes it to the on_request api
        const { id, data } = e.data;
        this.on_request(id, data);
    }

    // this api will be set to whatever the use wants the worker to do
    on_request(id: number, data: any) {
        console.log(id);
    }

    send_response(id: number, payload: any) {
        this.worker.postMessage({ // send the message back to the worker handle
            id: id,
            result: payload,
        })
    }
}

// this is essentially the thread handle for the main thread to track progress
class Thread {
    worker: Worker;
    requests: { [key: string]: any }; // requests object stores the promise handles for the requests
    
    constructor(path: string) {
        this.requests = {};

        console.log(":: New thread created...")
        // create worker
        const worker = new Worker(new URL(path, import.meta.url).href, {
            type: "module",
        });
        
        // assign worker methods to the class object
        this.worker = worker;
        worker.onmessage = (e: MessageEvent) => this.on_message(e);
        worker.onerror = (e: ErrorEvent) => this.on_error(e);
    }

    on_message(e: MessageEvent) {
        const { id, result } = e.data;
        console.log(":: Got " + id + " with result " + result)

        if (id in this.requests) {
            const { resolve, reject } = this.requests[id];
            delete this.requests[id];
            resolve(result)
        } else {
            console.log("INVALID TASK ID")
        }
    }

    on_error(e: ErrorEvent) {

    }

    send_request(data: any): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            this.requests[id] = { resolve, reject }; // add the handles for the promise into the requests object under the unique id of the job
            this.worker.postMessage({ id, data }) // send to the worker
        })
    }

    cancel_pending_requests(): void {
        let count = 0;
        Object.entries(this.requests).forEach(([id, promise_handles]) => {
            promise_handles.reject(":: Requests cancelled."); // reject the promise
            delete this.requests[id]; // remove the id from the requests list
            count++;
        })
        console.log(":: Cancelled requests totalling", count)
    }

    terminate() {
        this.cancel_pending_requests(); // clear all pending requests
        this.worker.terminate();
    }
}

const AsyncThreadWorker = { ThreadWorker, Thread };
export default AsyncThreadWorker;