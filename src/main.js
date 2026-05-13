import "./styles.css";
import { invoke } from "@tauri-apps/api/core";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="shell">
    <section class="panel">
      <p class="label">Remote Windows build</p>
      <h1>Tauri is running.</h1>
      <div class="controls">
        <input id="name" value="Marco" />
        <button id="run" type="button">Call Rust</button>
      </div>
      <pre id="output">Ready.</pre>
    </section>
  </main>
`;

const nameInput = document.querySelector("#name");
const runButton = document.querySelector("#run");
const output = document.querySelector("#output");

runButton.addEventListener("click", async () => {
  output.textContent = "Calling Rust...";
  try {
    const response = await invoke("greet", { name: nameInput.value || "world" });
    output.textContent = JSON.stringify(response, null, 2);
  } catch (error) {
    output.textContent = String(error);
  }
});
