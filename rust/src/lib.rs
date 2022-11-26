mod req;

use std::ffi::CStr;
use std::io::Read;
use dotext::{docx, MsDoc};

#[no_mangle]
pub extern "C" fn parseDOCX(filepath: *const u8) -> () {
    let path_str: &str; // define the rust type of string
    unsafe {
        path_str = CStr::from_ptr(filepath as *const i8) // unsafe parse the pointer into a Cstr
            .to_str()
            .expect("The string could not be parsed.");
    }
    println!(":: Filepath passed to Rust: {}", path_str);

    let mut file = docx::Docx::open(path_str)
        .expect("Failed to load .docx file from filepath.");

    let mut content = String::new();
    let _ = file.read_to_string(&mut content);

    println!(":: Docx file information: {:#?}", content);
    req::post_index(path_str, content).expect("Failed to post to index.");
}

use pdf_extract::extract_text;

#[no_mangle]
pub extern "C" fn parsePDF(filepath: *const i8) -> () {
    let path_str: &str; // define the rust type of string
    unsafe {
        path_str = CStr::from_ptr(filepath) // unsafe parse the pointer into a Cstr
            .to_str()
            .expect("The string could not be parsed.");
    }
    println!(":: Filepath passed to Rust: {}", path_str);

    let content = extract_text(path_str)
        .expect("Failed to load .pdf file from filepath.");

    println!(":: PDF file information: {}", content);

    req::post_index(path_str, content).expect("Failed to post to index.");
}