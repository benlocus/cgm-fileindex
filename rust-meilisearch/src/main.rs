use meilisearch_sdk::{
    indexes::*,
    client::*,
    search::*,
    settings::*
};
use serde::{Serialize, Deserialize};
use std::{io::prelude::*, fs::File};
use futures::executor::block_on;

#[derive(Serialize, Deserialize)]
struct Movie {
    id: i32,
    title: String,
    poster: String,
    overview: String,
    release_date: i64,
    genres: Vec<String>
}

fn main() { block_on(async move {
    let client = Client::new("http://localhost:7700", "MASTER_KEY");
  
    // reading and parsing the file
    let mut file = File::open("movies.json").unwrap(); // open the file and unwrap the result

    let mut content = String::new(); // create a new string to hold the JSON data

    file.read_to_string(&mut content).unwrap(); // read the file into a string using the stdlib implementation

    let movies_docs: Vec<Movie> = serde_json::from_str(&content).unwrap(); // create a serde_json object containing the string pulled from the file, then save it as a variable type casted as a vec of movies
  
    // adding documents
    client.index("movies") // select the index "movies"
      .add_documents(&movies_docs, None) // add the movies one without specifying a primary key (so that it will use the field with the name id as default)
      .await
      .unwrap();
})}  