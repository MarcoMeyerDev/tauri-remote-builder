import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <section class="shell">
    <p class="eyebrow">Vanilla HTML CSS JavaScript</p>
    <h1>Tauri desktop app</h1>
    <p class="lede">
      This frontend is plain HTML, CSS, and JavaScript. The button calls a Rust command through Tauri.
    </p>
    <div class="controls">
      <input id="name" value="Marco" aria-label="Name" />
      <button id="call-rust">Call Rust backend</button>
    </div>
    <pre id="output">Click the button to call Rust.</pre>
  </section>
`;

const input = document.querySelector("#name");
const output = document.querySelector("#output");
const button = document.querySelector("#call-rust");

button.addEventListener("click", async () => {
  output.textContent = "Calling Rust...";

  try {
    const result = await invoke("greet", { name: input.value.trim() || "friend" });
    output.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    output.textContent = String(error);
  }
});
