// import the native code
const library = Deno.dlopen('/Users/benduke/Projects/deno-fileserver/rust/target/debug/libparse.dylib', {
    "parseDOCX": { 
        parameters: ["buffer"], // accepts a buffer
        result: "pointer"
    }
})
const { parseDOCX } = library.symbols


// this is a web worker, meaning that this acts as the main function
self.onmessage = (e: MessageEvent) => {
    const filepath = e.data.filepath as string // type cast into a string
    const raw_path_pointer = new TextEncoder().encode(filepath + "\0") // encode as u8 array and add null terminator
    try {
        parseDOCX(raw_path_pointer)
        // console.log(":: --> Parsed .docx successfully...",);
    } catch (error) {
        console.error(error)
    }
    
    self.close();
};