use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct IndexEntry<'a> {
    filepath: &'a str,
    content: String
}

#[tokio::main]
pub async fn post_index(filepath: &str, content: String) -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new(); // create the http client
    let entry = IndexEntry {
        filepath,
        content
    };

    client.post("http://127.0.0.1:5173/api/index")
        .json(&entry)
        .send()
        .await?
        .json::<String>()
        .await?;
    Ok(())
}