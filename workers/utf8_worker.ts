import { IndexEntry } from "../indexer.ts"

// this is a web worker, meaning that this acts as the main function
self.onmessage = async (e: MessageEvent) => {
    const { filepath } = e.data;
    const text = await Deno.readTextFile(filepath);
    // console.log(":: --> Parsed Text:", text);

    const indexEntry: IndexEntry = {
        filepath,
        content: text
    }

    await fetch("http://127.0.0.1:5173/api/index", {
        method: "POST",
        body: JSON.stringify(indexEntry)
    })
    self.close();
};