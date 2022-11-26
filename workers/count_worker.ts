import { IndexEntry } from "../indexer.ts"

// this is a web worker, meaning that this acts as the main function
self.onmessage = async (e: MessageEvent) => {
    const { number, data } = e.data;
    console.log("--> Message in worker with payload: ", e.data)

    let i = 0;
    while (i < number) {
        i++;
    }

    self.postMessage({})
    self.close();
};