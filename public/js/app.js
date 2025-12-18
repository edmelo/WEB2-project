const API_URL = 'http://localhost:3000';

const state = {
    currentView: 'dashboard',
    token: localStorage.getItem('token'),
    users: [],
    products: [],
    orders: []
};

// Elementos DOM
const loginOverlay = document.getElementById('login-overlay');
const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const views = {
    dashboard: document.getElementById('view-dashboard'),
    users: document.getElementById('view-users'),
    products: document.getElementById('view-products'),
    orders: document.getElementById('view-orders')
};

const navItems = document.querySelectorAll('nav li');
const createBtn = document.getElementById('create-btn');
const modal = document.getElementById('modal-container');
const closeModalBtns = document.querySelectorAll('.close-modal');
const saveBtn = document.getElementById('save-btn');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const pageTitle = document.getElementById('page-title');

// Auth Logic
function checkAuth() {
    if (!state.token) {
        loginOverlay.classList.remove('hidden');
    } else {
        loginOverlay.classList.add('hidden');
        switchView('dashboard');
    }
}

loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            state.token = data.token;
            localStorage.setItem('token', data.token);
            loginOverlay.classList.add('hidden');
            checkAuth();
        } else {
            loginError.textContent = data.error || 'Falha no login';
            loginError.style.display = 'block';
        }
    } catch (e) {
        loginError.textContent = 'Erro de rede';
        loginError.style.display = 'block';
    }
});


// Navegação
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        switchView(tab);
    });
});

function switchView(viewName) {
    state.currentView = viewName;

    // Atualizar Nav
    navItems.forEach(item => {
        if (item.dataset.tab === viewName) item.classList.add('active');
        else item.classList.remove('active');
    });

    // Atualizar View
    Object.values(views).forEach(el => el.classList.remove('active'));
    views[viewName].classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Usuários',
        'products': 'Produtos',
        'orders': 'Pedidos'
    };
    pageTitle.textContent = titles[viewName];

    if (viewName !== 'dashboard') {
        fetchData(viewName);
        createBtn.style.display = 'block';
    } else {
        createBtn.style.display = 'none';
        refreshDashboard();
    }
}

// Busca de Dados com Auth Header
async function fetchData(entity) {
    if (!state.token) return;

    try {
        const res = await fetch(`${API_URL}/${entity}`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            state.token = null;
            checkAuth();
            return;
        }

        const data = await res.json();
        state[entity] = data;
        renderTable(entity, data);
    } catch (err) {
        showToast('Falha ao buscar dados', 'error');
    }
}

function renderTable(entity, data) {
    const tbody = document.getElementById(`${entity}-table-body`);
    tbody.innerHTML = '';

    if (!Array.isArray(data)) return;

    data.forEach(item => {
        const tr = document.createElement('tr');

        // ... (Mesma lógica de renderização, simplificada para brevidade mas mantendo a estrutura)
        let columns = '';
        if (entity === 'users') {
            columns = `<td>${item.id}</td><td>${item.name}</td><td>${item.email}</td><td>${new Date(item.createdAt).toLocaleDateString()}</td>`;
        } else if (entity === 'products') {
            columns = `<td>${item.id}</td><td>${item.name}</td><td>R$ ${item.price}</td><td>${item.stock}</td>`;
        } else if (entity === 'orders') {
            columns = `<td>${item.id}</td><td>${item.userId}</td><td>${item.productId}</td><td>${item.quantity}</td><td>${item.status}</td>`;
        }

        tr.innerHTML = `${columns}<td><button class="action-btn delete-btn" onclick="deleteItem('${entity}', ${item.id})">Excluir</button></td>`;
        tbody.appendChild(tr);
    });
}

// Dashboard
async function refreshDashboard() {
    if (!state.token) return;
    await Promise.all([
        fetchData('users'),
        fetchData('products'),
        fetchData('orders')
    ]);

    document.getElementById('total-users').textContent = state.users.length || 0;
    document.getElementById('total-products').textContent = state.products.length || 0;
    document.getElementById('total-orders').textContent = state.orders.length || 0;
}

// Modal & Formulários
createBtn.addEventListener('click', () => {
    openModal();
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
});

function openModal() {
    const entityNames = {
        'users': 'Usuário',
        'products': 'Produto',
        'orders': 'Pedido'
    };
    modalTitle.textContent = `Criar ${entityNames[state.currentView]}`;
    modalBody.innerHTML = generateForm(state.currentView);
    modal.classList.remove('hidden');
}

function generateForm(entity) {
    if (entity === 'users') {
        return `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="input-name" placeholder="João da Silva">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="input-email" placeholder="joao@exemplo.com">
            </div>
             <div class="form-group">
                <label>Senha</label>
                <input type="password" id="input-password" placeholder="******">
            </div>
        `;
    } else if (entity === 'products') {
        return `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="input-name" placeholder="Nome do Produto">
            </div>
            <div class="form-group">
                <label>Preço</label>
                <input type="number" id="input-price" placeholder="0.00">
            </div>
             <div class="form-group">
                <label>Estoque</label>
                <input type="number" id="input-stock" placeholder="0">
            </div>
        `;
    } else if (entity === 'orders') {
        return `
            <div class="form-group">
                <label>ID do Usuário</label>
                <input type="number" id="input-userId" placeholder="ID do Usuário">
            </div>
            <div class="form-group">
                <label>ID do Produto</label>
                <input type="number" id="input-productId" placeholder="ID do Produto">
            </div>
             <div class="form-group">
                <label>Quantidade</label>
                <input type="number" id="input-quantity" value="1">
            </div>
        `;
    }
}

// Ação de Criar com Auth
saveBtn.addEventListener('click', async () => {
    const entity = state.currentView;
    let payload = {};

    if (entity === 'users') {
        payload = {
            name: document.getElementById('input-name').value,
            email: document.getElementById('input-email').value,
            password: document.getElementById('input-password').value // Send Password
        };
    } else if (entity === 'products') {
        payload = {
            name: document.getElementById('input-name').value,
            price: parseFloat(document.getElementById('input-price').value),
            stock: parseInt(document.getElementById('input-stock').value)
        };
    } else if (entity === 'orders') {
        payload = {
            userId: parseInt(document.getElementById('input-userId').value),
            productId: parseInt(document.getElementById('input-productId').value),
            quantity: parseInt(document.getElementById('input-quantity').value)
        };
    }

    try {
        const res = await fetch(`${API_URL}/${entity}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            modal.classList.add('hidden');
            fetchData(entity);
            showToast('Item criado com sucesso', 'success');
        } else {
            const err = await res.json();
            showToast(err.error || 'Falha ao criar', 'error');
        }
    } catch (e) {
        showToast('Erro de rede', 'error');
    }
});

// Ação de Excluir com Auth
window.deleteItem = async (entity, id) => {
    if (!confirm('Tem certeza?')) return;

    try {
        const res = await fetch(`${API_URL}/${entity}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (res.ok) {
            fetchData(entity);
            showToast('Item excluído', 'success');
        } else {
            showToast('Falha ao excluir', 'error');
        }
    } catch (e) {
        showToast('Erro de rede', 'error');
    }
};

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `stat-card`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    toast.style.color = 'white';
    toast.style.padding = '1rem';
    toast.style.zIndex = '2000';
    toast.innerText = msg;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializar
checkAuth();
