import AsyncThreadWorker from "./threadworker.ts";

const thread = new AsyncThreadWorker.Thread("./workers/count_worker.ts");

for (let payload of ['a', 'b', 'c', 'd']) {
    console.log("adding new request")
    payload = payload.toUpperCase()
    const response = await thread.send_request(payload);
    console.log("here is the response recieved on the main thread", response);
}