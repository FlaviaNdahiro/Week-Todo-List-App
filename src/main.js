import './style.css'

document.querySelector('#app').innerHTML = `
  <div id="app-root" class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200 py-8 px-4 flex justify-center items-start">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
      
      <!-- Header & Theme Toggle -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">TaskBloom ✿</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">A little progress every day.</p>
        </div>
        <button id="theme-toggle" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm">
          🌙
        </button>
      </div>

      <!-- Add Task Form -->
      <form id="todo-form" class="space-y-3 mb-6">
        <div>
          <input 
            type="text" 
            id="todo-input" 
            placeholder="What do you want to do today?" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition"
          />
          <p id="error-msg" class="text-red-500 text-xs mt-1 hidden">Please enter a valid task (cannot be empty).</p>
        </div>
        <div class="flex gap-2">
          <input 
            type="date" 
            id="date-input" 
            class="w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <button 
            type="submit" 
            class="w-1/2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-xl shadow-md transition text-sm cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </form>

      <!-- Filters -->
      <div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-4 text-xs font-medium">
        <button data-filter="all" class="filter-btn flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm transition text-purple-600 dark:text-purple-400">All</button>
        <button data-filter="active" class="filter-btn flex-1 py-2 rounded-lg text-slate-600 dark:text-slate-400 transition">Active</button>
        <button data-filter="completed" class="filter-btn flex-1 py-2 rounded-lg text-slate-600 dark:text-slate-400 transition">Completed</button>
      </div>

      <!-- Task List -->
      <ul id="todo-list" class="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
        <!-- Dynamic Tasks Go Here -->
      </ul>

      <!-- Footer Stats & Actions -->
      <div class="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <span id="task-counter">0 tasks remaining</span>
        <button id="clear-completed" class="hover:text-red-500 transition cursor-pointer">Clear completed</button>
      </div>

    </div>
  </div>
`;

// App Logic
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const errorMsg = document.getElementById('error-msg');
const todoList = document.getElementById('todo-list');
const taskCounter = document.getElementById('task-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// Theme persistence
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// Save & Render
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  render();
}

// Add Task with Validation
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const dueDate = dateInput.value;

  if (!text) {
    errorMsg.classList.remove('hidden');
    return;
  }
  errorMsg.classList.add('hidden');

  todos.push({
    id: Date.now(),
    text: text,
    completed: false,
    dueDate: dueDate || null
  });

  input.value = '';
  dateInput.value = '';
  saveAndRender();
});

// Filter selection
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-purple-600', 'dark:text-purple-400');
      b.classList.add('text-slate-600', 'dark:text-slate-400');
    });
    btn.classList.add('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-purple-600', 'dark:text-purple-400');
    btn.classList.remove('text-slate-600', 'dark:text-slate-400');

    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveAndRender();
});

// Render Function
function render() {
  todoList.innerHTML = '';

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  // Empty State
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
        ✨ You're all caught up! No tasks here.
      </div>
    `;
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 transition ${todo.completed ? 'opacity-60 line-through' : ''}`;
    
    li.innerHTML = `
      <div class="flex items-center gap-3 flex-1 min-w-0 mr-2">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} class="toggle-checkbox w-4 h-4 accent-purple-600 rounded cursor-pointer" data-id="${todo.id}">
        <div class="flex flex-col flex-1 min-w-0">
          <span class="todo-text truncate text-sm cursor-pointer" data-id="${todo.id}">${escapeHtml(todo.text)}</span>
          ${todo.dueDate ? `<span class="text-[10px] text-purple-500 dark:text-purple-400">Due: ${todo.dueDate}</span>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button class="edit-btn p-1.5 text-slate-400 hover:text-purple-600 transition text-xs" data-id="${todo.id}">✏️</button>
        <button class="delete-btn p-1.5 text-slate-400 hover:text-red-500 transition text-xs" data-id="${todo.id}">🗑️</button>
      </div>
    `;
    todoList.appendChild(li);
  });

  // Update Counter
  const remainingCount = todos.filter(t => !t.completed).length;
  taskCounter.textContent = `${remainingCount} task${remainingCount === 1 ? '' : 's'} remaining`;

  attachEventListeners();
}

// Event Listeners for Dynamic Elements (Checkbox, Delete with Confirmation, Edit in-place)
function attachEventListeners() {
  // Checkbox complete toggle
  document.querySelectorAll('.toggle-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const id = Number(e.target.dataset.id);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = e.target.checked;
        saveAndRender();
      }
    });
  });

  // Delete with Confirmation
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const confirmed = confirm("Are you sure you want to delete this task?");
      if (confirmed) {
        todos = todos.filter(t => t.id !== id);
        saveAndRender();
      }
    });
  });

  // Edit in place
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        const newText = prompt("Edit your task:", todo.text);
        if (newText !== null) {
          const trimmed = newText.trim();
          if (trimmed !== "") {
            todo.text = trimmed;
            saveAndRender();
          } else {
            alert("Task text cannot be empty!");
          }
        }
      }
    });
  });
}

// Security helper to prevent HTML injection
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initial render
render();
