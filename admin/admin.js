const SUPABASE_URL = 'https://gndndhfzxhmuteemrifz.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_8RXoGFe6WNb1t7OTIOP1Gg___LXxyrg';

const API_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// State
let currentRoute = '#/';
let activeTable = '';

// DOM Elements
const contentDiv = document.getElementById('admin-content');
const pageTitle = document.getElementById('page-title');
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const toastContainer = document.getElementById('toast-container');

// Utilities
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded shadow-md text-white font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} transition-opacity duration-300 opacity-0`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.remove('opacity-0'), 10);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.closeModal = function() {
    modalContainer.classList.add('hidden');
    modalBody.innerHTML = '';
}

function openModal(contentHtml) {
    modalBody.innerHTML = contentHtml;
    modalContainer.classList.remove('hidden');
}

// API Methods
async function apiFetch(endpoint, options = {}) {
    try {
        const url = `${SUPABASE_URL}${endpoint}`;
        const defaultOptions = { headers: API_HEADERS };
        const finalOptions = { ...defaultOptions, ...options };

        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        if (response.status === 204) return null; // No content for deletes
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Base UI Builder Methods
function buildTableHtml(headers, rowsHtml, emptyMessage = "Nenhum registro encontrado.") {
    return `
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            ${headers.map(h => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${rowsHtml || `<tr><td colspan="${headers.length + 1}" class="px-6 py-4 text-center text-gray-500">${emptyMessage}</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function buildHeaderActions(buttonText, onClickAttr) {
    return `
        <div class="mb-6 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Listagem</h3>
            <button onclick="${onClickAttr}" class="bg-amazon-yellow hover:bg-amazon-orange text-amazon px-4 py-2 rounded shadow transition-colors font-medium">
                + ${buttonText}
            </button>
        </div>
    `;
}

function renderLoader() {
    contentDiv.innerHTML = `
        <div class="flex justify-center items-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
        </div>
    `;
}

// Base CRUD handlers
window.deleteRecord = async function(table, id) {
    if (!confirm(`Tem certeza que deseja excluir o registro #${id}?`)) return;
    try {
        await apiFetch(`/${table}?id=eq.${id}`, { method: 'DELETE' });
        showToast('Registro excluído com sucesso!');
        handleRoute(); // Refresh current page
    } catch (e) {
        // Error already handled in apiFetch
    }
}

// Router
const routes = {
    '#/': renderDashboard,
    '#/categorias': renderCategorias,
    '#/produtos': renderProdutos,
    '#/cupons': renderCupons,
    '#/promocoes': renderPromocoes,
    '#/pedidos': renderPedidos
};

async function renderDashboard() {
    pageTitle.textContent = 'Dashboard';
    activeTable = '';

    renderLoader();
    try {
        // Simple counts for dashboard
        const catRes = await fetch(`${SUPABASE_URL}/categorias?select=id`, { headers: { ...API_HEADERS, 'Prefer': 'count=exact' }});
        const prodRes = await fetch(`${SUPABASE_URL}/produtos?select=id`, { headers: { ...API_HEADERS, 'Prefer': 'count=exact' }});
        const venRes = await fetch(`${SUPABASE_URL}/vendas?select=id`, { headers: { ...API_HEADERS, 'Prefer': 'count=exact' }});

        // Headers not fully working in plain fetch for counts sometimes if not exposed,
        // fallback to data length if needed, but lets just try grabbing a few.
        const catData = await apiFetch('/categorias?select=id');
        const prodData = await apiFetch('/produtos?select=id');
        const venData = await apiFetch('/vendas?select=id');

        contentDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow p-6 border-l-4 border-amazon-yellow">
                    <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Total de Produtos</h3>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${prodData.length}</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Total de Categorias</h3>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${catData.length}</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Total de Pedidos</h3>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${venData.length}</p>
                </div>
            </div>

            <div class="mt-8 bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Bem-vindo ao Painel Administrativo</h3>
                <p class="text-gray-600">Selecione uma opção no menu lateral para gerenciar os dados da loja CompFast.</p>
            </div>
        `;
    } catch (e) {
        contentDiv.innerHTML = `<div class="text-red-500">Erro ao carregar dashboard.</div>`;
    }
}

// --- CATEGORIAS CRUD ---
async function renderCategorias() {
    pageTitle.textContent = 'Categorias';
    activeTable = 'categorias';
    renderLoader();
    try {
        const categorias = await apiFetch('/categorias?order=id.asc');

        let rowsHtml = '';
        categorias.forEach(cat => {
            rowsHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cat.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${cat.nome}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${cat.descricao || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editCategoria(${cat.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button onclick="deleteRecord('categorias', ${cat.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        });

        const headerHtml = buildHeaderActions('Nova Categoria', 'openCategoriaForm()');
        const tableHtml = buildTableHtml(['ID', 'Nome', 'Descrição'], rowsHtml);

        contentDiv.innerHTML = headerHtml + tableHtml;
    } catch (e) {
        contentDiv.innerHTML = `<div class="text-red-500">Erro ao carregar categorias.</div>`;
    }
}

window.openCategoriaForm = function(categoria = null) {
    const isEdit = !!categoria;
    const formHtml = `
        <h3 class="text-lg font-medium text-gray-900 mb-4">${isEdit ? 'Editar' : 'Nova'} Categoria</h3>
        <form id="categoria-form" onsubmit="saveCategoria(event, ${isEdit ? categoria.id : 'null'})">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" id="cat-nome" value="${isEdit ? categoria.nome : ''}" required class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amazon-yellow">
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea id="cat-desc" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amazon-yellow">${isEdit ? (categoria.descricao || '') : ''}</textarea>
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-amazon-yellow text-amazon font-medium rounded hover:bg-amazon-orange">Salvar</button>
            </div>
        </form>
    `;
    openModal(formHtml);
}

window.editCategoria = async function(id) {
    try {
        const data = await apiFetch(`/categorias?id=eq.${id}&select=*`);
        if (data && data.length > 0) openCategoriaForm(data[0]);
    } catch (e) {}
}

window.saveCategoria = async function(e, id) {
    e.preventDefault();
    const nome = document.getElementById('cat-nome').value;
    const descricao = document.getElementById('cat-desc').value;

    const payload = { nome, descricao };

    try {
        if (id) {
            await apiFetch(`/categorias?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            showToast('Categoria atualizada!');
        } else {
            await apiFetch(`/categorias`, { method: 'POST', body: JSON.stringify(payload) });
            showToast('Categoria criada!');
        }
        closeModal();
        handleRoute(); // Refresh
    } catch (e) {}
}

// --- PRODUTOS CRUD ---
async function renderProdutos() {
    pageTitle.textContent = 'Produtos';
    activeTable = 'produtos';
    renderLoader();
    try {
        const [produtos, categorias] = await Promise.all([
            apiFetch('/produtos?order=id.asc'),
            apiFetch('/categorias?select=id,nome')
        ]);

        const catMap = categorias.reduce((acc, c) => ({...acc, [c.id]: c.nome}), {});

        let rowsHtml = '';
        produtos.forEach(p => {
            const price = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const catName = catMap[p.categoria_id] || p.categoria_id;
            rowsHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <img src="${p.imagem_url || 'https://via.placeholder.com/50'}" alt="${p.nome}" class="h-10 w-10 object-cover rounded">
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${p.nome}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${catName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${price}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.estoque} un.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editProduto(${p.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button onclick="deleteRecord('produtos', ${p.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        });

        const headerHtml = buildHeaderActions('Novo Produto', 'openProdutoForm()');
        const tableHtml = buildTableHtml(['Imagem', 'Nome', 'Categoria', 'Preço', 'Estoque'], rowsHtml);

        contentDiv.innerHTML = headerHtml + tableHtml;
    } catch (e) {
        contentDiv.innerHTML = `<div class="text-red-500">Erro ao carregar produtos.</div>`;
    }
}

window.openProdutoForm = async function(produto = null) {
    const isEdit = !!produto;
    try {
        const categorias = await apiFetch('/categorias?select=id,nome&order=nome.asc');
        let catOptions = categorias.map(c =>
            `<option value="${c.id}" ${isEdit && produto.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`
        ).join('');

        const formHtml = `
            <h3 class="text-lg font-medium text-gray-900 mb-4">${isEdit ? 'Editar' : 'Novo'} Produto</h3>
            <form id="produto-form" onsubmit="saveProduto(event, ${isEdit ? produto.id : 'null'})">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input type="text" id="prod-nome" value="${isEdit ? produto.nome : ''}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea id="prod-desc" rows="2" class="w-full border border-gray-300 rounded px-3 py-2">${isEdit ? (produto.descricao || '') : ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                        <input type="number" id="prod-preco" step="0.01" min="0" value="${isEdit ? produto.preco : ''}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select id="prod-cat" required class="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                            <option value="">Selecione...</option>
                            ${catOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                        <input type="number" id="prod-estoque" min="0" value="${isEdit ? produto.estoque : '0'}" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Imagem (Upload salva no BD como Base64)</label>
                        <input type="file" id="prod-imagem-file" accept="image/*" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <input type="hidden" id="prod-imagem-base64" value="${isEdit ? (produto.imagem_url || '') : ''}">
                        ${isEdit && produto.imagem_url ? `<div class="mt-2 text-sm text-gray-500">Imagem atual já carregada.</div>` : ''}
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-amazon-yellow text-amazon font-medium rounded hover:bg-amazon-orange">Salvar</button>
                </div>
            </form>
        `;
        openModal(formHtml);

        // Handle file to base64
        document.getElementById('prod-imagem-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('prod-imagem-base64').value = event.target.result;
            };
            reader.readAsDataURL(file);
        });

    } catch (e) {
        showToast('Erro ao abrir formulário de produto', 'error');
    }
}

window.editProduto = async function(id) {
    try {
        const data = await apiFetch(`/produtos?id=eq.${id}&select=*`);
        if (data && data.length > 0) openProdutoForm(data[0]);
    } catch (e) {}
}

window.saveProduto = async function(e, id) {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('prod-nome').value,
        descricao: document.getElementById('prod-desc').value,
        preco: parseFloat(document.getElementById('prod-preco').value),
        categoria_id: parseInt(document.getElementById('prod-cat').value),
        estoque: parseInt(document.getElementById('prod-estoque').value || 0),
        imagem_url: document.getElementById('prod-imagem-base64').value
    };

    try {
        if (id) {
            await apiFetch(`/produtos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            showToast('Produto atualizado!');
        } else {
            await apiFetch(`/produtos`, { method: 'POST', body: JSON.stringify(payload) });
            showToast('Produto criado!');
        }
        closeModal();
        handleRoute();
    } catch (e) {}
}

// --- CUPONS CRUD ---
async function renderCupons() {
    pageTitle.textContent = 'Cupons';
    activeTable = 'cupons';
    renderLoader();
    try {
        const cupons = await apiFetch('/cupons?order=id.asc');

        let rowsHtml = '';
        cupons.forEach(cupom => {
            const status = new Date(cupom.data_expiracao) < new Date() ?
                '<span class="text-red-500 font-medium">Expirado</span>' :
                '<span class="text-green-500 font-medium">Ativo</span>';

            rowsHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 uppercase">${cupom.codigo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cupom.desconto_percentual}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(cupom.data_expiracao).toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${status}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editCupom(${cupom.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button onclick="deleteRecord('cupons', ${cupom.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        });

        const headerHtml = buildHeaderActions('Novo Cupom', 'openCupomForm()');
        const tableHtml = buildTableHtml(['Código', 'Desconto (%)', 'Expiração', 'Status'], rowsHtml);

        contentDiv.innerHTML = headerHtml + tableHtml;
    } catch (e) {
        contentDiv.innerHTML = `<div class="text-red-500">Erro ao carregar cupons.</div>`;
    }
}

window.openCupomForm = function(cupom = null) {
    const isEdit = !!cupom;
    const dateValue = isEdit && cupom.data_expiracao ? cupom.data_expiracao.split('T')[0] : '';

    const formHtml = `
        <h3 class="text-lg font-medium text-gray-900 mb-4">${isEdit ? 'Editar' : 'Novo'} Cupom</h3>
        <form id="cupom-form" onsubmit="saveCupom(event, ${isEdit ? cupom.id : 'null'})">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input type="text" id="cupom-codigo" value="${isEdit ? cupom.codigo : ''}" required class="w-full border border-gray-300 rounded px-3 py-2 uppercase">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                <input type="number" id="cupom-desc" step="0.1" min="0" max="100" value="${isEdit ? cupom.desconto_percentual : ''}" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                <input type="date" id="cupom-data" value="${dateValue}" required class="w-full border border-gray-300 rounded px-3 py-2">
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-amazon-yellow text-amazon font-medium rounded hover:bg-amazon-orange">Salvar</button>
            </div>
        </form>
    `;
    openModal(formHtml);
}

window.editCupom = async function(id) {
    try {
        const data = await apiFetch(`/cupons?id=eq.${id}&select=*`);
        if (data && data.length > 0) openCupomForm(data[0]);
    } catch (e) {}
}

window.saveCupom = async function(e, id) {
    e.preventDefault();
    const payload = {
        codigo: document.getElementById('cupom-codigo').value.toUpperCase(),
        desconto_percentual: parseFloat(document.getElementById('cupom-desc').value),
        data_expiracao: document.getElementById('cupom-data').value + 'T23:59:59'
    };

    try {
        if (id) {
            await apiFetch(`/cupons?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            showToast('Cupom atualizado!');
        } else {
            await apiFetch(`/cupons`, { method: 'POST', body: JSON.stringify(payload) });
            showToast('Cupom criado!');
        }
        closeModal();
        handleRoute();
    } catch (e) {}
}

// --- PROMOÇÕES CRUD ---
// Supõe-se uma tabela 'promocoes' no Supabase: id, nome, desconto_percentual, data_expiracao, categoria_id (opcional), produto_id (opcional)
async function renderPromocoes() {
    pageTitle.textContent = 'Promoções (Regras de Desconto)';
    activeTable = 'promocoes';
    renderLoader();
    try {
        // Tenta buscar as promoções (ignora falha caso a tabela não exista, cria mensagem educada)
        const promocoes = await apiFetch('/promocoes?order=id.asc');

        let rowsHtml = '';
        promocoes.forEach(p => {
            const escopo = p.produto_id ? `Produto ID: ${p.produto_id}` : (p.categoria_id ? `Cat ID: ${p.categoria_id}` : 'Global');
            const status = new Date(p.data_expiracao) < new Date() ? 'Expirada' : 'Ativa';

            rowsHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.nome}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.desconto_percentual}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escopo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(p.data_expiracao).toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${status === 'Ativa' ? 'text-green-500' : 'text-red-500'}">${status}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editPromocao(${p.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button onclick="deleteRecord('promocoes', ${p.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        });

        const headerHtml = buildHeaderActions('Nova Promoção', 'openPromocaoForm()');
        const tableHtml = buildTableHtml(['Nome', 'Desconto (%)', 'Escopo', 'Expiração', 'Status'], rowsHtml);

        contentDiv.innerHTML = headerHtml + tableHtml;
    } catch (e) {
        // Se a tabela 'promocoes' não estiver criada, informamos amigavelmente
        contentDiv.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div class="flex">
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            A tabela <b>promocoes</b> ainda não foi encontrada no banco de dados.
                            Crie-a no Supabase com os campos: id, nome, desconto_percentual, data_expiracao, categoria_id (int, opcional), produto_id (int, opcional).
                        </p>
                    </div>
                </div>
            </div>
            <div class="text-red-500">Erro: ${e.message}</div>
        `;
    }
}

window.openPromocaoForm = async function(promo = null) {
    const isEdit = !!promo;
    const dateValue = isEdit && promo.data_expiracao ? promo.data_expiracao.split('T')[0] : '';

    try {
        const [categorias, produtos] = await Promise.all([
            apiFetch('/categorias?select=id,nome'),
            apiFetch('/produtos?select=id,nome')
        ]);

        let catOptions = categorias.map(c => `<option value="${c.id}" ${isEdit && promo.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`).join('');
        let prodOptions = produtos.map(p => `<option value="${p.id}" ${isEdit && promo.produto_id === p.id ? 'selected' : ''}>${p.nome}</option>`).join('');

        const formHtml = `
            <h3 class="text-lg font-medium text-gray-900 mb-4">${isEdit ? 'Editar' : 'Nova'} Promoção</h3>
            <form id="promo-form" onsubmit="savePromocao(event, ${isEdit ? promo.id : 'null'})">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Promoção</label>
                        <input type="text" id="promo-nome" value="${isEdit ? promo.nome : ''}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                        <input type="number" id="promo-desc" step="0.1" min="0" max="100" value="${isEdit ? promo.desconto_percentual : ''}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                        <input type="date" id="promo-data" value="${dateValue}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Aplicar a Categoria</label>
                        <select id="promo-cat" class="w-full border border-gray-300 rounded px-3 py-2 bg-white" onchange="document.getElementById('promo-prod').value=''">
                            <option value="">-- Nenhuma (Opcional) --</option>
                            ${catOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ou aplicar a Produto</label>
                        <select id="promo-prod" class="w-full border border-gray-300 rounded px-3 py-2 bg-white" onchange="document.getElementById('promo-cat').value=''">
                            <option value="">-- Nenhum (Opcional) --</option>
                            ${prodOptions}
                        </select>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-amazon-yellow text-amazon font-medium rounded hover:bg-amazon-orange">Salvar</button>
                </div>
            </form>
        `;
        openModal(formHtml);
    } catch (e) {
        showToast('Erro ao abrir formulário', 'error');
    }
}

window.editPromocao = async function(id) {
    try {
        const data = await apiFetch(`/promocoes?id=eq.${id}&select=*`);
        if (data && data.length > 0) openPromocaoForm(data[0]);
    } catch (e) {}
}

window.savePromocao = async function(e, id) {
    e.preventDefault();

    const catId = document.getElementById('promo-cat').value;
    const prodId = document.getElementById('promo-prod').value;

    const payload = {
        nome: document.getElementById('promo-nome').value,
        desconto_percentual: parseFloat(document.getElementById('promo-desc').value),
        data_expiracao: document.getElementById('promo-data').value + 'T23:59:59',
        categoria_id: catId ? parseInt(catId) : null,
        produto_id: prodId ? parseInt(prodId) : null
    };

    try {
        if (id) {
            await apiFetch(`/promocoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            showToast('Promoção atualizada!');
        } else {
            await apiFetch(`/promocoes`, { method: 'POST', body: JSON.stringify(payload) });
            showToast('Promoção criada!');
        }
        closeModal();
        handleRoute();
    } catch (e) {}
}

// --- PEDIDOS (VENDAS) CRUD ---
async function renderPedidos() {
    pageTitle.textContent = 'Gestão de Pedidos';
    activeTable = 'vendas';
    renderLoader();
    try {
        const vendas = await apiFetch('/vendas?order=created_at.desc');

        let rowsHtml = '';
        vendas.forEach(venda => {
            const total = parseFloat(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const dataPedido = new Date(venda.created_at).toLocaleString('pt-BR');
            let statusBadge = '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendente</span>';

            // Simulating basic statuses if "status" column exists, defaulting to Pendente
            if (venda.status === 'pago') statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Pago</span>';
            if (venda.status === 'cancelado') statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelado</span>';

            rowsHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${venda.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${dataPedido}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${venda.endereco_entrega || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${total}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="viewPedido(${venda.id})" class="text-blue-600 hover:text-blue-900">Detalhes</button>
                    </td>
                </tr>
            `;
        });

        // No 'Nova Venda' button for admin normally, just listing
        const headerHtml = `
            <div class="mb-6 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Últimos Pedidos</h3>
                <button onclick="handleRoute()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow transition-colors font-medium">
                    Atualizar
                </button>
            </div>
        `;
        const tableHtml = buildTableHtml(['ID', 'Data', 'Endereço', 'Total', 'Status'], rowsHtml);

        contentDiv.innerHTML = headerHtml + tableHtml;
    } catch (e) {
        contentDiv.innerHTML = `<div class="text-red-500">Erro ao carregar pedidos.</div>`;
    }
}

window.viewPedido = async function(id) {
    try {
        const vendaData = await apiFetch(`/vendas?id=eq.${id}&select=*`);
        if (!vendaData || vendaData.length === 0) return;
        const venda = vendaData[0];

        // Fetch itens (assuming venda_itens table exists)
        let itensHtml = '<tr><td colspan="4" class="text-center py-4">Itens não encontrados</td></tr>';
        try {
            const itens = await apiFetch(`/venda_itens?venda_id=eq.${id}&select=*,produtos(nome)`);
            if (itens && itens.length > 0) {
                itensHtml = itens.map(i => `
                    <tr class="border-b">
                        <td class="py-2">${i.produtos?.nome || 'Produto ID ' + i.produto_id}</td>
                        <td class="py-2 text-center">${i.quantidade}</td>
                        <td class="py-2 text-right">R$ ${parseFloat(i.preco_unitario).toFixed(2)}</td>
                        <td class="py-2 text-right font-medium">R$ ${(i.quantidade * i.preco_unitario).toFixed(2)}</td>
                    </tr>
                `).join('');
            }
        } catch(e) {
            // Fallback se a relação de produtos falhar
        }

        const modalHtml = `
            <h3 class="text-lg font-medium text-gray-900 mb-4">Detalhes do Pedido #${venda.id}</h3>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-3 rounded border">
                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Informações do Cliente</p>
                    <p class="text-sm"><b>Endereço:</b> ${venda.endereco_entrega}</p>
                    <p class="text-sm"><b>Método Pagamento:</b> ${venda.metodo_pagamento || 'N/A'}</p>
                    <p class="text-sm"><b>Data:</b> ${new Date(venda.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded border">
                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Resumo Financeiro</p>
                    <p class="text-sm"><b>Total:</b> R$ ${parseFloat(venda.total).toFixed(2)}</p>
                    ${venda.cupom_id ? `<p class="text-sm text-green-600"><b>Cupom Aplicado ID:</b> ${venda.cupom_id}</p>` : ''}
                </div>
            </div>

            <h4 class="font-medium text-gray-800 mb-2">Itens do Pedido</h4>
            <div class="bg-white border rounded overflow-hidden mb-6">
                <table class="w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="py-2 px-3 text-left">Produto</th>
                            <th class="py-2 px-3 text-center">Qtd</th>
                            <th class="py-2 px-3 text-right">Preço Un.</th>
                            <th class="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHtml}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onclick="updatePedidoStatus(${venda.id}, 'cancelado')" class="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50">Cancelar Pedido</button>
                <button type="button" onclick="updatePedidoStatus(${venda.id}, 'pago')" class="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700">Marcar como Pago</button>
            </div>
        `;
        openModal(modalHtml);
    } catch(e) {
        showToast('Erro ao carregar detalhes do pedido', 'error');
    }
}

window.updatePedidoStatus = async function(id, novoStatus) {
    if (!confirm(`Alterar pedido #${id} para ${novoStatus}?`)) return;
    try {
        await apiFetch(`/vendas?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: novoStatus })
        });
        showToast(`Pedido marcado como ${novoStatus}!`);
        closeModal();
        handleRoute();
    } catch(e) {
        showToast('Erro ao atualizar status', 'error');
    }
}

async function handleRoute() {
    const hash = window.location.hash || '#/';
    currentRoute = hash;

    // Update active state on nav
    document.querySelectorAll('aside nav a').forEach(a => {
        a.classList.remove('bg-amazon-light', 'font-bold');
        if (a.getAttribute('href') === hash) {
            a.classList.add('bg-amazon-light', 'font-bold');
        }
    });

    const routeFunc = routes[hash] || renderDashboard;
    await routeFunc();
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);
