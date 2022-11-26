interface WorkerThread {
    id: number
    thread: Worker
}

class ThreadPool {
    size: number;
    threads: Array<WorkerThread>;
    channel: BroadcastChannel;

    constructor(size: number) {
        if (!(size > 0)) {
            throw new Error("Failed to initialize the threadpool, please enter a positive number for the pool size.")
        }

        const channel = new BroadcastChannel("thread_pool")
        // init properties
        this.size = size;
        this.threads = [];
        this.channel = channel

        // initialize the threads into the active pool
        for (let i = 0; i < 4; i++) {
            this.threads.push({
                id: i,
                thread: new Worker(new URL("./workers/http_worker.ts", import.meta.url).href, {
                    type: "module",
                })
            })
        }
    }

    async execute(message: string): Promise<void> {
        // // create new worker from URL (can be changed to pass in a url in the future)
        // const worker = new Worker(new URL("./workers/http_worker.ts", import.meta.url).href, {
        //     type: "module",
        // });
        // console.log(':: New Worker Spinning')
        // worker.postMessage({ message: "General Kenobi" });

        // this.active.push(worker); // add to the number of active threads
        // console.log(":: New Thread --> Active threads:", this.active)

        this.channel.postMessage(message)
    }
}

// set up server
const server = Deno.listen({ port: 9090 });
console.log(":: HTTP Sever --> port: 9090")

// set up pool
export const pool = new ThreadPool(4);
console.log(":: New ThreadPool Created with Threads: ", pool.threads)

// route to async serve function
for await (const conn of server) {
    console.log("new conn")
    serve_http(conn, pool);
}

// handle requests
async function serve_http(conn: Deno.Conn, pool: ThreadPool) {
    
    const http_conn = Deno.serveHttp(conn);
    for await (const request_event of http_conn) {

        // send to thread here ->
        // const worker = new Worker(new URL("./workers/http_worker.ts", import.meta.url).href, {
        //     type: "module",
        // });
        // console.log(':: New Worker Spinning')
        // worker.postMessage({ message: "General Kenobi" });

        const worker = await pool.execute("General Kenobi")
    
        // receive from thread here ->
        worker.onmessage = ((msg: MessageEvent) => {
            pool.active--; // when the worker returns a message (only happens at the end of it's lifetime, remove it from the number of active threads)
            console.log(":: Cleaned Thread --> Active threads:", pool.active)
            request_event.respondWith(
                new Response(`Number returned from worker: ${msg.data.num}`, {
                    status: 200
                })
            );
        })
    }
}


