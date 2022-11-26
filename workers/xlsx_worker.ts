import xlsx from "npm:xlsx@0.18"
import { IndexEntry } from "../indexer.ts"

// this is a web worker, meaning that this acts as the main function
self.onmessage = async (e: MessageEvent) => {
    const { filepath } = e.data;
    const file = xlsx.readFile(filepath);

    let text: Array<string> = [] // init the text list

    for (let i = 0; i < file.SheetNames.length; i++) {
        const sheetBuffer = xlsx.utils.sheet_to_txt(file.Sheets[file.SheetNames[i]])
        sheetBuffer.forEach(res => text.push(res))
    }

    // console.log(":: --> Parsed .xlsx:", text);

    const indexEntry: IndexEntry = {
        filepath,
        content: text.join()
    }

    await fetch("http://127.0.0.1:5173/api/index", {
        method: "POST",
        body: JSON.stringify(indexEntry)
    })

    self.close();
};