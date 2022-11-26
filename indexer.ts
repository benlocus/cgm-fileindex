import { ThreadPool } from "./threadpool.ts"

// type definition for the api
export interface IndexEntry {
    filepath: string,
    content: string
}


// declare what kind of files we will engage with here
type Filetype = 'md' | 'txt' | 'ts' | 'xlsx' | 'docx' | 'pdf'

// function to parse the file type
function getFileExt(path: string): Filetype {
    let filetype: Array<string> = []
    for (let i = path.length - 1; i > 0; i--) {
        if (path[i] === ".") {
            return filetype.join("") as Filetype
        }
        filetype.unshift(path[i])
    }
    throw new Error("Failed to parse filepath for extension")
}

/** Ingests a filepath, parses the filetype, and then routes to the correct worker, which will handle the text parsing and post to the Search Index. */
export function workerIndex(filepath: string) {
    const filetype = getFileExt(filepath)

    switch(filetype) {
        case 'xlsx': {
            console.log(':: Reading .xlsx...')
            const worker = new Worker(new URL("./workers/xlsx_worker.ts", import.meta.url).href, {
                type: "module",
            });
        
            console.log(':: New Worker Spinning')
            worker.postMessage({ filepath });
            
            break
        }
        case 'docx': {
            console.log(':: Reading .docx...')
            const worker = new Worker(new URL("./workers/docx_worker.ts", import.meta.url).href, {
                type: "module",
            });
        
            console.log(':: New Worker Spinning')
            worker.postMessage({ filepath });
            break
        }
        case 'pdf': {
            console.log(':: Reading .pdf...')
            const worker = new Worker(new URL("./workers/pdf_worker.ts", import.meta.url).href, {
                type: "module",
            });
        
            console.log(':: New Worker Spinning')
            worker.postMessage({ filepath });
            break

        }
        default: {
            // ---------------- this is the thing to await
            const worker = new Worker(new URL("./workers/utf8_worker.ts", import.meta.url).href, {
                type: "module",
            });
        
            console.log(':: New Worker Spinning')
            worker.postMessage({ filepath });
            // ----------------
            break
        }
    }

}