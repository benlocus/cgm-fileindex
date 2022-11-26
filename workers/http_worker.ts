import { delay } from "https://deno.land/std@0.136.0/async/mod.ts";
import { pool } from "../threadpool.ts"

console.log("Hello, worker!")

pool.channel.onmessage = (message: MessageEvent) => {
    console.log(message)
}

// self.onmessage = async (e: MessageEvent) => {
    
//     // First await: waits for a second, then continues running the module.
//     await delay(1000);

//     let num = 0;
//     for (let i = 0; i < 1000000000; i++) {
//         num += i;
//     } 

//     self.postMessage({num})
    
//     self.close();
// };