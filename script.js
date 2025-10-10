// script.js - versione aggiornata con drag & drop, persistenza e funzioni extra

// -----------------------------
// Utility
// -----------------------------
const UID = () => 't' + Math.random().toString(36).slice(2,9);

const defaultData = [
    /*
    { id: 'task1', title: 'Navbar mobile', desc: 'Correggere comportamento su schermi piccoli', priority: 'high', assignee:'', status: 'backlog' },
    { id: 'task2', title: 'Dark mode', desc: 'Aggiungere interruttore tema scuro', priority: 'medium', assignee:'', status: 'inProgress' },
    { id: 'task3', title: 'Ottimizzare query', desc: 'Ridurre tempi risposta', priority: 'critical', assignee:'', status: 'review' }
     */
];

const STORAGE_KEY = 'devtask:data';

// -----------------------------
// Stato e DOM
// -----------------------------
let tasks = [];
const columns = {
    backlog: document.querySelector('#backlog .tasks'),
    inProgress: document.querySelector('#inProgress .tasks'),
    review: document.querySelector('#review .tasks'),
    done: document.querySelector('#done .tasks')
};

const counts = Array.from(document.querySelectorAll('.column')).reduce((acc, col) => {
    acc[col.id] = col.querySelector('.count');
    return acc;
}, {});

// modal & form
const modal = document.getElementById('modal');
const newIssueBtn = document.getElementById('newIssueBtn');
const issueForm = document.getElementById('issueForm');
const searchInput = document.getElementById('search');

// -----------------------------
// Persistenza
// -----------------------------
function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            tasks = JSON.parse(raw);
            return;
        } catch (e) {
            console.warn('Errore parsing localStorage, ricarico default');
        }
    }
    tasks = defaultData.slice();
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// -----------------------------
// Rendering
// -----------------------------
function clearColumns() {
    Object.values(columns).forEach(c => {
        c.innerHTML = '';
    });
}

function render() {
    clearColumns();
    const q = searchInput.value.trim().toLowerCase();
    const filtered = tasks.filter(t => {
        if (!q) return true;
        return (
            (t.title || '').toLowerCase().includes(q) ||
            (t.desc || '').toLowerCase().includes(q) ||
            (t.assignee || '').toLowerCase().includes(q)
        );
    });

    const byStatus = { backlog: [], inProgress: [], review: [], done: [] };
    filtered.forEach(t => (byStatus[t.status] || byStatus.backlog).push(t));

    // Ordina per priorità decrescente
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    Object.values(byStatus).forEach(list => {
        list.sort((a, b) => {
            const aPri = priorityOrder[a.priority] ?? 3;
            const bPri = priorityOrder[b.priority] ?? 3;
            return aPri - bPri;
        });
    });

    Object.entries(byStatus).forEach(([status, list]) => {
        const container = columns[status];
        if (!container) return;
        if (list.length === 0) {
            const p = document.createElement('div');
            p.className = 'empty';
            p.textContent = 'Nessuna issue';
            container.appendChild(p);
        } else {
            list.forEach(t => container.appendChild(makeCard(t)));
        }
        // aggiorna conteggio totale (non solo filtrato)
        const colEl = document.getElementById(status);
        const total = tasks.filter(tt => tt.status === status).length;
        colEl.querySelector('.count').textContent = total;
    });

    attachDragHandlers();
    save();
}

// -----------------------------
// Creazione card DOM
// -----------------------------
function makeCard(task) {
    const card = document.createElement('div');
    card.className = 'task';
    card.setAttribute('draggable', 'true');
    card.dataset.id = task.id;

    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;

    const desc = document.createElement('p');
    desc.className = 'task-desc';
    desc.textContent = task.desc;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const pri = document.createElement('span');
    pri.className = 'task-priority ' + (task.priority || 'low');
    pri.textContent = task.priority || 'low';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    right.style.alignItems = 'center';

    if (task.assignee) {
        const a = document.createElement('span');
        a.textContent = task.assignee;
        a.title = 'Assegnato a';
        right.appendChild(a);
    }

    meta.appendChild(pri);
    meta.appendChild(right);

    const btns = document.createElement('div');
    btns.className = 'btns';

    const moveBtn = document.createElement('button');
    moveBtn.className = 'small move-btn';
    moveBtn.textContent = 'Sposta';
    moveBtn.addEventListener('click', () => openMoveMenu(task.id));

    const editBtn = document.createElement('button');
    editBtn.className = 'small edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEditDialog(task.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'small delete-btn';
    delBtn.textContent = 'Elimina';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    btns.appendChild(moveBtn);
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);
    card.appendChild(btns);

    // keyboard accessibility
    card.tabIndex = 0;
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            openEditDialog(task.id);
        }
    });

    return card;
}

// -----------------------------
// Drag & Drop
// -----------------------------
let draggedId = null;

function attachDragHandlers() {
    const cards = document.querySelectorAll('.task[draggable="true"]');
    cards.forEach(card => {
        card.removeEventListener('dragstart', onDragStart);
        card.removeEventListener('dragend', onDragEnd);
        card.addEventListener('dragstart', onDragStart);
        card.addEventListener('dragend', onDragEnd);
    });

    const cols = document.querySelectorAll('.column');
    cols.forEach(col => {
        col.removeEventListener('dragover', onDragOver);
        col.removeEventListener('dragenter', onDragEnter);
        col.removeEventListener('dragleave', onDragLeave);
        col.removeEventListener('drop', onDrop);

        col.addEventListener('dragover', onDragOver);
        col.addEventListener('dragenter', onDragEnter);
        col.addEventListener('dragleave', onDragLeave);
        col.addEventListener('drop', onDrop);
    });
}

function onDragStart(e) {
    draggedId = this.dataset.id;
    e.dataTransfer.setData('text/plain', draggedId);
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '0.6';
}

function onDragEnd(e) {
    draggedId = null;
    this.style.opacity = '';
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(e) {
    e.preventDefault();
    if (e.currentTarget.classList) e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
    // Rimuovi solo se stiamo lasciando la colonna stessa, non i suoi figli
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
        if (e.currentTarget.classList) e.currentTarget.classList.remove('drag-over');
    }
}

function onDrop(e) {
    e.preventDefault();
    const col = e.currentTarget;
    if (col && draggedId) {
        const id = e.dataTransfer.getData('text/plain') || draggedId;
        moveTaskTo(id, col.dataset.status);
    }
    col.classList.remove('drag-over');
}

// -----------------------------
// Azioni task
// -----------------------------
function moveTaskTo(id, status) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.status = status;
    render();
}

function deleteTask(id) {
    if (!confirm('Eliminare questa issue?')) return;
    tasks = tasks.filter(t => t.id !== id);
    render();
}

// edit
function openEditDialog(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    // riusa il modal come form di edit
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('title').value = t.title;
    document.getElementById('desc').value = t.desc;
    document.getElementById('priority').value = t.priority;
    document.getElementById('assignee').value = t.assignee || '';
    document.getElementById('status').value = t.status || 'backlog';
    issueForm.dataset.editing = id;
}

/// move quick (dopo click su "Sposta")
function openMoveMenu(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    
    // Rimuovi eventuali menu esistenti
    const existingMenu = document.querySelector('.move-menu');
    if (existingMenu) existingMenu.remove();
    
    // Trova la card della task
    const taskCard = document.querySelector(`.task[data-id="${id}"]`);
    if (!taskCard) return;
    
    // Crea menu contestuale
    const menu = document.createElement('div');
    menu.className = 'move-menu';
    
    const columns = [
        { value: 'backlog', label: 'Backlog' },
        { value: 'inProgress', label: 'In Progress' },
        { value: 'review', label: 'Review' },
        { value: 'done', label: 'Done' }
    ];
    
    columns.forEach(col => {
        if (col.value !== t.status) {
            const btn = document.createElement('button');
            btn.textContent = col.label;
            btn.addEventListener('click', () => {
                moveTaskTo(id, col.value);
                menu.remove();
                removeListeners();
            });
            menu.appendChild(btn);
        }
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annulla';
    cancelBtn.className = 'cancel';
    cancelBtn.addEventListener('click', () => {
        menu.remove();
        removeListeners();
    });
    menu.appendChild(cancelBtn);
    
    document.body.appendChild(menu);
    
    // Posiziona il menu sotto la card
    const rect = taskCard.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 5;
    
    // Ottieni dimensioni del menu
    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    
    // Controlla se va fuori a destra
    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
    }
    
    // Controlla se va fuori a sinistra
    if (left < 10) {
        left = 10;
    }
    
    // Controlla se va fuori in basso
    if (top + menuHeight > window.innerHeight) {
        // Posiziona sopra la card invece che sotto
        top = rect.top - menuHeight - 5;
    }
    
    // Controlla se va fuori in alto
    if (top < 10) {
        top = 10;
    }
    
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    
    // Funzioni per chiudere il menu
    function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            removeListeners();
        }
    }
    
    function closeOnKey(e) {
        if (e.key === 'Escape') {
            menu.remove();
            removeListeners();
        }
    }
    
    function closeOnScroll() {
        menu.remove();
        removeListeners();
    }
    
    function removeListeners() {
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('keydown', closeOnKey);
        window.removeEventListener('scroll', closeOnScroll, true);
    }
    
    // Aggiungi listener per chiudere il menu
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
        document.addEventListener('keydown', closeOnKey);
        window.addEventListener('scroll', closeOnScroll, true);
    }, 100);
}

// -----------------------------
// Form nuova/edit
// -----------------------------
newIssueBtn.addEventListener('click', () => {
    issueForm.removeAttribute('data-editing');
    issueForm.reset();
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('title').focus();
});

document.getElementById('closeModal').addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
});

document.getElementById('cancelCreate').addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
});

issueForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const idEditing = issueForm.dataset.editing;
    const payload = {
        title: document.getElementById('title').value.trim(),
        desc: document.getElementById('desc').value.trim(),
        priority: document.getElementById('priority').value,
        assignee: document.getElementById('assignee').value.trim(),
        status: document.getElementById('status').value
    };

    if (idEditing) {
        const t = tasks.find(x => x.id === idEditing);
        if (t) {
            Object.assign(t, payload);
        }
    } else {
        const newTask = { id: UID(), ...payload };
        tasks.push(newTask);
    }

    modal.setAttribute('aria-hidden', 'true');
    issueForm.removeAttribute('data-editing');
    issueForm.reset();
    render();
});

// -----------------------------
// Ricerca live
// -----------------------------
searchInput.addEventListener('input', () => {
    render();
});

// -----------------------------
// Inizializzazione
// -----------------------------
function init() {
    load();
    render();
    // initial focus trap/click outside to close modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
    });
}

init();
