// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::path::PathBuf;
use std::path::Path;
use homedir::get_my_home;
use std::fs::{File};
use std::fs;
use std::io::Write;
use std::io::Read;
use std::io::BufReader;
use rodio::{Decoder, OutputStream, source::Source, Sink};

//State
struct ApplicationState(Sink, String);

fn main() {
  //Rodio Sink initialisation
  let (_stream, stream_handle) = OutputStream::try_default().unwrap();
  let sink = Sink::try_new(&stream_handle).unwrap();
  json_exists(&get_my_home().unwrap().unwrap().as_path().join("Music").join("Playlists"));
  tauri::Builder::default()
    .manage(ApplicationState(sink, String::from(get_my_home().unwrap().unwrap().as_path().join("Music").join("Playlists").to_str().unwrap())))
    .invoke_handler(tauri::generate_handler![play_music, toggle_music, song_over,get_json_file,get_song_lists])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

//Checks if the json config file exists
fn json_exists(test: &Path){
  if !test.join("musikly_config.json").exists(){
    let mut file = File::create(test.join("musikly_config.json"))
        .unwrap();
    file.write_all(
r#"{
   "playlists":[]
}"#.as_bytes());
  }else{
    println!("Musikly config file exists");
  }
}

//Play A Song
#[tauri::command]
fn play_music(state: tauri::State<ApplicationState>,name:Vec<&str>)->bool{
  if(!state.0.empty()){
    toggle_music(state);
    return true;
  }

  for i in 0..name.len(){
    //Gets the File
    let file = BufReader::new(File::open(Path::new(state.1.as_str()).join(name[i])).unwrap());
    // Decode that sound file into a source
    let source = Decoder::new(file).unwrap();
    state.0.append(source);
  }
  true
}

//Check if song is over
#[tauri::command]
fn song_over(state: tauri::State<ApplicationState>,name:&str)->bool{
  state.0.empty()
}

//Get the JSON File
#[tauri::command]
fn get_json_file(state: tauri::State<ApplicationState>)->String{
  let mut file = File::open(
    Path::new(
      state.1.as_str()
    ).join("musikly_config.json")
  ).unwrap();
  let mut contents = String::new();
  file.read_to_string(&mut contents).unwrap();

  contents
}

//Toggles the music
#[tauri::command]
fn toggle_music(state: tauri::State<ApplicationState>)->bool{
  println!("{}", state.0.is_paused());
  if !state.0.is_paused(){
    state.0.pause();
  }else{
    state.0.play();
  }
  true
}

//Gets all the songs in the folder playlists
#[tauri::command]
fn get_song_lists(state: tauri::State<ApplicationState>)->Vec<String>{
  let mut songs:Vec<String> = Vec::new();
  for i in Path::new(state.1.as_str()).read_dir().expect("Path call failed"){
    if let Ok(i) = i{
      let d = i.path();
      if d.extension().unwrap()=="mp3"{
        songs.push(String::from(d.file_name().unwrap().to_str().unwrap()));
      }
    }
  }
  return songs;
}