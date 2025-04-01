document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const themeToggle = document.getElementById('themeToggle');
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');

    // Task array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize
    renderTasks();
    updateStats();

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        const newTask = {
            id: Date.now(),
            title,
            category,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        
        // Reset form
        taskForm.reset();
        document.getElementById('taskTitle').focus();
    });

    // Render tasks
    function renderTasks() {
        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p>No tasks yet. Add one above!</p>';
            return;
        }
        
        tasksContainer.innerHTML = '';
        
        // Sort tasks by priority (high first) and then by creation date (newest first)
        const sortedTasks = [...tasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority] || 
                   new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
            
            taskEl.innerHTML = `
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-category">${task.category}</span>
                        <span>Priority: ${task.priority}</span>
                        <span>Due: ${dueDate}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-complete" data-id="${task.id}">✓</button>
                    <button class="btn-edit" data-id="${task.id}">✎</button>
                    <button class="btn-delete" data-id="${task.id}">✕</button>
                </div>
            `;
            
            if (task.completed) {
                taskEl.style.opacity = '0.7';
                taskEl.querySelector('.task-title').style.textDecoration = 'line-through';
            }
            
            tasksContainer.appendChild(taskEl);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', toggleComplete);
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', editTask);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }

    // Toggle task completion
    function toggleComplete(e) {
        const taskId = parseInt(e.target.getAttribute('data-id'));
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    // Edit task
    function editTask(e) {
        const taskId = parseInt(e.target.getAttribute('data-id'));
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate;
            
            // Remove the task from the array
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    // Delete task
    function deleteTask(e) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskId = parseInt(e.target.getAttribute('data-id'));
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Update statistics
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
    }

    // Toggle dark/light theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.removeItem('darkMode');
        }
    }
});