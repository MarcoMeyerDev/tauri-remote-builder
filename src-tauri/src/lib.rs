#[derive(serde::Deserialize)]
struct Task {
    title: String,
    priority: String,
}

#[derive(serde::Serialize)]
struct FocusReply {
    message: String,
    picked_title: String,
}

#[tauri::command]
fn pick_focus(tasks: Vec<Task>) -> FocusReply {
    let picked = tasks
        .iter()
        .max_by_key(|task| match task.priority.as_str() {
            "high" => 3,
            "medium" => 2,
            _ => 1,
        })
        .expect("tasks should not be empty");

    FocusReply {
        message: format!("Focus next: {}. It has {} priority.", picked.title, picked.priority),
        picked_title: picked.title.clone(),
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![pick_focus])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
