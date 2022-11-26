import AsyncThreadWorker from "../threadworker.ts"
import { delay } from "https://deno.land/std@0.136.0/async/delay.ts";

class CountThreadWorker extends AsyncThreadWorker.ThreadWorker {
    async on_request(id: number, data: any) {
        console.log(":: Worker got message: ", data)

        await delay(3000)

        this.send_response(id, data)
    }
}

const thread_worker = new CountThreadWorker(self);