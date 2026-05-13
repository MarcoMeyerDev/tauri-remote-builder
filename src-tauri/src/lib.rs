use serde::Serialize;

#[derive(Serialize)]
struct GreetReply {
    message: String,
    backend: String,
}

#[tauri::command]
fn greet(name: String) -> GreetReply {
    GreetReply {
        message: format!("Hello, {name}. This response came from Rust."),
        backend: "tauri-rust".to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
