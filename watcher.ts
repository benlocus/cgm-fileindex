import { workerIndex } from "./indexer.ts";

const watcher = Deno.watchFs(Deno.cwd() + "/files");
const notifiers = new Map<string, number>(); // map to store the recent events in

const exists = async (filename: string): Promise<boolean> => {
    try {
        await Deno.stat(filename);
        // successful, file or directory must exist
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            // file or directory does not exist
            return false;
        } else {
            // unexpected error, maybe permissions, pass it along
            throw error;
        }
    }
};

for await (const event of watcher) { // async event loop
    const dataString = JSON.stringify(event); // get a JSON object of the event
    if (notifiers.has(dataString)) { // check and see if the notifiers map already has the exact JSON object stored
        clearTimeout(notifiers.get(dataString)); // reset the timeout for that object
        notifiers.delete(dataString); // remove from the map to avoid duplicates
    }

    // begin debounce function -----------------------------
    notifiers.set( // add to the recent list with the following key/value pair
        dataString, // key
        setTimeout(async () => { // value is the timeout, after which the notifier will be removed and the event logged
        // Send to buffer here
        if (event.kind !== "remove" && !event.paths[0].includes("~$")) {
            if (await exists(event.paths[0])) { // check and make sure that the file exists
                workerIndex(event.paths[0]) // ---> send to the worker routing
            }
        }

            notifiers.delete(dataString);
            console.log({ event });
        }, 20) // 20ms debounce
    );
}