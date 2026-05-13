import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const STORAGE_KEY = "orbit.todo.items.v1";
const FILTERS = ["all", "active", "done"];
let todos = loadTodos();
let filter = "all";
let query = "";

const app = document.querySelector("#app");
app.innerHTML = `
  <section class="ambient"></section>
  <section class="dashboard">
    <header class="hero">
      <div>
        <p class="eyebrow">Orbit Todo</p>
        <h1>Plan the next clean move.</h1>
      </div>
      <button class="focus-button" id="focus">Daily focus</button>
    </header>
    <section class="stats" aria-label="Todo stats">
      <article><span id="stat-total">0</span><p>Total</p></article>
      <article><span id="stat-active">0</span><p>Active</p></article>
      <article><span id="stat-done">0%</span><p>Complete</p></article>
    </section>
    <form class="composer" id="composer">
      <input id="title" autocomplete="off" placeholder="Add a task and press Enter" />
      <select id="priority" aria-label="Priority">
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="low">Low</option>
      </select>
      <button>Add</button>
    </form>
    <section class="toolbar">
      <div class="filters" id="filters"></div>
      <input id="search" autocomplete="off" placeholder="Search tasks" />
    </section>
    <p class="focus-note" id="focus-note">Your Rust backend can pick the most useful task to do next.</p>
    <section class="list" id="list" aria-live="polite"></section>
  </section>
`;

const elements = {
  composer: document.querySelector("#composer"),
  title: document.querySelector("#title"),
  priority: document.querySelector("#priority"),
  filters: document.querySelector("#filters"),
  search: document.querySelector("#search"),
  list: document.querySelector("#list"),
  focus: document.querySelector("#focus"),
  focusNote: document.querySelector("#focus-note"),
  total: document.querySelector("#stat-total"),
  active: document.querySelector("#stat-active"),
  done: document.querySelector("#stat-done"),
};

elements.filters.innerHTML = FILTERS.map((name) => `<button data-filter="${name}" class="filter">${name}</button>`).join("");

elements.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(elements.title.value, elements.priority.value);
});

elements.search.addEventListener("input", (event) => {
  query = event.target.value.trim().toLowerCase();
  render();
});

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  filter = button.dataset.filter;
  render();
});

elements.list.addEventListener("click", (event) => {
  const row = event.target.closest("[data-id]");
  if (!row) return;
  if (event.target.matches("[data-toggle]")) toggleTodo(row.dataset.id);
  if (event.target.matches("[data-delete]")) deleteTodo(row.dataset.id);
});

elements.focus.addEventListener("click", async () => {
  const activeTodos = todos.filter((todo) => !todo.done);
  if (activeTodos.length === 0) {
    elements.focusNote.textContent = "Everything is complete. Add one useful next move.";
    return;
  }
  elements.focusNote.textContent = "Asking Rust for a focus pick...";
  const result = await invoke("pick_focus", { tasks: activeTodos });
  elements.focusNote.textContent = result.message;
});

function addTodo(title, priority) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  todos.unshift({ id: crypto.randomUUID(), title: cleanTitle, priority, done: false, createdAt: new Date().toISOString() });
  elements.title.value = "";
  elements.priority.value = "medium";
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function getVisibleTodos() {
  return todos.filter((todo) => {
    const matchesFilter = filter === "all" || (filter === "active" && !todo.done) || (filter === "done" && todo.done);
    const matchesQuery = !query || todo.title.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });
}

function render() {
  const visibleTodos = getVisibleTodos();
  const completeCount = todos.filter((todo) => todo.done).length;
  const activeCount = todos.length - completeCount;
  const percent = todos.length ? Math.round((completeCount / todos.length) * 100) : 0;
  elements.total.textContent = todos.length;
  elements.active.textContent = activeCount;
  elements.done.textContent = `${percent}%`;
  document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  if (visibleTodos.length === 0) {
    elements.list.innerHTML = `<section class="empty"><strong>No matching tasks.</strong><span>Add a task, clear search, or switch filters.</span></section>`;
    return;
  }
  elements.list.innerHTML = visibleTodos.map(renderTodo).join("");
}

function renderTodo(todo) {
  const created = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(todo.createdAt));
  return `<article class="todo ${todo.done ? "done" : ""}" data-id="${todo.id}"><button class="check" data-toggle aria-label="Toggle task">${todo.done ? "✓" : ""}</button><div class="todo-body"><h2>${escapeHtml(todo.title)}</h2><p>${created}</p></div><span class="pill ${todo.priority}">${todo.priority}</span><button class="delete" data-delete aria-label="Delete task">Delete</button></article>`;
}

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return [
    { id: crypto.randomUUID(), title: "Build a clean Tauri app remotely", priority: "high", done: false, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "Keep Windows free of build toolchain clutter", priority: "medium", done: false, createdAt: new Date().toISOString() },
  ];
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

render();
