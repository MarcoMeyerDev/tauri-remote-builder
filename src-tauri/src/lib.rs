#[derive(serde::Serialize)]
struct GreetReply {
    message: String,
    backend: &'static str,
}

#[tauri::command]
fn greet(name: String) -> GreetReply {
    GreetReply {
        message: format!("Hello, {name}. This response came from Rust."),
        backend: "tauri-rust",
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
