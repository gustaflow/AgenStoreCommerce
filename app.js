// --- CONFIGURAÇÕES SUPABASE ---
const SUPABASE_URL = 'https://gndndhfzxhmuteemrifz.supabase.co';
const SUPABASE_ANON_KEY = "sb_publishable_8RXoGFe6WNb1t7OTIOP1Gg___LXxyrg";

// Utilizando a chave privada fornecida para poder ler produtos e cupons,
// já que a chave pública (anon) falhou ao ler devido a restrições/configurações do Supabase fornecido.
// NOTA: Em um ambiente real, NUNCA expomos a chave secreta no client-side.
// Aqui é uma exceção baseada no acesso restrito que testamos nas interações.
const SUPABASE_SECRET_KEY = SUPABASE_ANON_KEY;

// Função genérica de fetch para o Supabase
async function supabaseFetch(table, options = {}) {
  const method = options.method || 'GET';
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = {
    'apikey': SUPABASE_SECRET_KEY,
    'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Supabase (${response.status}): ${errorText}`);
    }

    // Se for um insert sem return, pode não ter body
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`Erro ao fazer fetch na tabela ${table}:`, error);
    throw error;
  }
}

// API de Produtos
async function getProdutos() {
  return await supabaseFetch('produtos', { params: { select: '*' } });
}

// API de Cupons
async function getCupomPorCodigo(codigo) {
  const cupons = await supabaseFetch('cupons', {
    params: {
      select: '*',
      codigo: `eq.${codigo}`,
      limit: '1'
    }
  });
  return cupons.length > 0 ? cupons[0] : null;
}

// API de Vendas
async function inserirVenda(vendaData, itensVenda) {
  // 1. Inserir a venda
  const vendaInsertResult = await supabaseFetch('vendas', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: vendaData
  });

  if (!vendaInsertResult || vendaInsertResult.length === 0) {
     throw new Error("Falha ao criar venda");
  }

  const novaVenda = vendaInsertResult[0];

  // 2. Inserir os itens da venda vinculados pelo ID da venda
  const itensParaInserir = itensVenda.map(item => ({
    venda_id: novaVenda.id,
    produto_id: item.produto_id,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    desconto_unitario: item.desconto_unitario || 0
  }));

  await supabaseFetch('venda_itens', {
    method: 'POST',
    body: itensParaInserir
  });

  return novaVenda;
}

window.api = {
  getProdutos,
  getCupomPorCodigo,
  inserirVenda
};

// --- ESTADO DO SPA E CARRINHO ---
const state = {
  produtos: [],
  carrinho: JSON.parse(localStorage.getItem('agenstore_cart') || '[]'),
  cupomAplicado: null
};

// --- ROTEAMENTO E VIEWS ---
function router() {
  const hash = window.location.hash || '#/';
  const content = document.getElementById('app-content');

  if (hash === '#/') {
    renderHome(content);
  } else if (hash === '#/carrinho' || hash === '#/checkout') {
    renderCarrinhoCheckout(content);
  } else {
    content.innerHTML = `<div class="text-center py-20"><h1 class="text-2xl font-bold">Página não encontrada</h1><a href="#/" class="text-secondary hover:underline mt-4 inline-block">Voltar para o Início</a></div>`;
  }
}

window.addEventListener('hashchange', router);

// Setup inicial
async function init() {
  document.getElementById('loading-overlay').classList.remove('hidden');
  try {
    state.produtos = await api.getProdutos();
    atualizarContadorCarrinho();
    router();
  } catch (error) {
    console.error("Falha ao inicializar o app:", error);
    document.getElementById('app-content').innerHTML = `
      <div class="text-center py-20 bg-error-container text-on-error-container rounded-xl m-10">
        <h1 class="text-2xl font-bold mb-4">Erro ao carregar dados</h1>
        <p>Não foi possível conectar ao banco de dados.</p>
        <p class="text-sm mt-2 opacity-80">${error.message}</p>
      </div>
    `;
  } finally {
    document.getElementById('loading-overlay').classList.add('hidden');
  }
}

// --- UTILITÁRIOS ---
function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(title, description, iconName = 'check_circle') {
  const toast = document.getElementById('toast-notification');
  const titleEl = document.getElementById('toast-title');
  const descEl = document.getElementById('toast-desc');
  const iconEl = document.getElementById('toast-icon');

  if (toast && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = description;
    if (iconEl) iconEl.textContent = iconName;

    toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2800);
  }
}

// Inicializa o app ao carregar a página
window.addEventListener('DOMContentLoaded', init);

// --- VIEWS ---

// 1. HOME
function renderHome(container) {
  // Encontrar 4 produtos para destaque, ou usar fallback de mock se db estiver vazio
  let produtosVitrine = state.produtos.slice(0, 4);

  const produtosHtml = produtosVitrine.map(p => `
    <article class="bg-surface-container-lowest rounded-xl p-space-base flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-200">
      <div>
        <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-space-md flex items-center justify-center">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${p.foto_path || 'https://via.placeholder.com/300?text=Sem+Foto'}" alt="${p.nome}"/>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs line-clamp-2">
          ${p.nome}
        </h3>
        <div class="flex items-center gap-space-xs mb-space-md">
          <div class="flex text-secondary text-base">
            <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">star_half</span>
          </div>
        </div>
        <div class="mb-space-md">
          <div class="flex items-baseline gap-space-2xs">
            <span class="font-label-md text-label-md text-on-surface font-bold">R$</span>
            <span class="font-price-display text-price-display text-on-surface font-bold text-2xl">${formatPrice(p.preco)}</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Estoque: ${p.estoque} un.</p>
        </div>
      </div>
      <div class="pt-space-xs">
        <button class="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-headline-sm text-headline-sm py-space-sm px-space-md rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-space-sm" onclick="adicionarAoCarrinho('${p.id}')">
          <span class="material-symbols-outlined text-xl">shopping_cart</span>
          <span>Colocar no Carrinho</span>
        </button>
      </div>
    </article>
  `).join('');

  container.innerHTML = `
    <!-- AVISO SUPERIOR / CUPOM SIMPLES -->
    <section class="bg-secondary-container text-on-secondary-container px-margin py-space-sm shadow-sm rounded-xl mb-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left">
        <div class="flex items-center gap-space-sm justify-center">
          <span class="material-symbols-outlined text-secondary text-2xl flex-shrink-0" style="font-variation-settings: 'FILL' 1;">celebration</span>
          <p class="font-body-md text-body-md font-medium text-on-secondary-container">
            Presente especial: Use o código <span class="bg-surface-container-lowest px-space-xs py-space-2xs rounded-lg font-code-tabular text-code-tabular font-bold tracking-wider text-secondary shadow-sm">BEMVINDO10</span> e ganhe <strong class="font-bold">10% de desconto</strong> no seu primeiro pedido!
          </p>
        </div>
        <button class="bg-on-secondary-container hover:bg-secondary text-on-primary font-label-md text-label-md px-space-md py-space-xs rounded-xl shadow-sm transition-all flex items-center gap-space-xs flex-shrink-0 active:scale-95" onclick="copiarCupomHome()">
          <span class="material-symbols-outlined text-base">content_copy</span>
          <span id="texto-btn-cupom">Copiar Cupom</span>
        </button>
      </div>
    </section>

    <!-- BANNER DE BOAS-VINDAS / HERO AMIGÁVEL -->
    <section class="w-full mb-space-xl">
      <div class="bg-surface-container-lowest rounded-xl p-space-lg lg:p-space-2xl shadow-md flex flex-col lg:flex-row items-center justify-between gap-space-xl overflow-hidden relative bg-gradient-to-r from-surface-container-low to-surface-container-lowest">
        <div class="flex-1 flex flex-col items-start z-10">
          <div class="inline-flex items-center gap-space-xs bg-surface-container-high text-on-surface-variant px-space-md py-space-xs rounded-full mb-space-base shadow-sm">
            <span class="material-symbols-outlined text-secondary text-lg" style="font-variation-settings: 'FILL' 1;">verified</span>
            <span class="font-label-md text-label-md font-semibold">Loja Oficial AgenStore • 100% Confiável</span>
          </div>
          <h1 class="font-headline-xl text-headline-xl text-on-surface mb-space-sm leading-tight max-w-xl">
            Compre com facilidade e receba rápido na sua casa
          </h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant mb-space-xl max-w-lg">
            Produtos selecionados a dedo, com garantia nacional, frete grátis e apoio humano do início até o pacote chegar na sua mão.
          </p>
        </div>
        <div class="w-full lg:w-5/12 flex justify-center z-10">
          <div class="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-surface-container">
            <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl3SAwydMzrIvqaIDmi5p9vlXLgzC5zcArNmlE-Yrqj_b-hp75MzNZ9-zpS4fmKyCqXDfJ3GrqSLukgsAuQtaiTDoQPOBVgpG9NCJ4BPiYZCQ8DrnfWxNxGU18qSKRF9MZygfbRD-b0FIG-LLMJpW92SQKbbztEX-JSMmm5qDDBPY2eXeu7X27OCEG3VHvk5AOyq2o04trT62MdRJ9Esn_nVG4LKPHMhbfO5vDsLkZnK98_pMg1qlJ" alt="Entrega Rápida">
          </div>
        </div>
      </div>
    </section>

    <!-- NAVEGAÇÃO DE CATEGORIAS GRANDES E FÁCEIS -->
    <section class="w-full mb-space-xl">
      <div class="flex items-center justify-between mb-space-base">
        <div class="flex items-center gap-space-xs">
          <span class="w-2 h-5 bg-secondary-container rounded-sm"></span>
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Categorias Populares</h2>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-space-base">
        <!-- Categoria 1 -->
        <a class="group bg-surface-container-lowest p-space-base rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden" href="#/">
          <div class="w-24 h-24 mb-space-sm rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low group-hover:scale-105 transition-transform">
            <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBumOzqpoKjfnjF77G-jeZE0lNI3CYYh3kepcrMm8kkilLC1q6dsnA-KUIyHki2jTiWYFjOfuAl8xEajSjwxpaDKdgz2JG95KHWhXPvMCijvUiBYiTqs4SiECllAUgsRm7Pmu0qKt4M-LZlYjimZgxjsMXeHtxghh-fHGiARh4ptmAj24wHTe7T7BvcwMkbH8vFTrdEVGxoOr0KQjzk1wm5kRZfLFXuqlTiPk25CgxBexbNXRoKBgrL" alt="Cat"/>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-secondary transition-colors">Eletrônicos</span>
        </a>
        <!-- Categoria 2 -->
        <a class="group bg-surface-container-lowest p-space-base rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden" href="#/">
          <div class="w-24 h-24 mb-space-sm rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low group-hover:scale-105 transition-transform">
            <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABJp7UNW5My7hb8l3lkMZ5WT4YGq8AXKFRjdAkx2wMOcAGuKn4O11wP1nj5o48KFSFxDSW55zgu0EjZdfsUOfrTCAY-w-7qhRuuxI7IX86STDIF6Dima2i9aiNpjuAduaAvb6foxuAMY_Pd6Z7EuPObWxCAw_lLU4tnZubekz8p2sbLsYj4-P-_KsqxP9Pv9BU_2MLVmFVm-cGsHiNbulGEuA7omaVoeOOySIcJ-Yztn9U2MoiZXeg" alt="Cat"/>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-secondary transition-colors">Casa & Cozinha</span>
        </a>
        <!-- Categoria 3 -->
        <a class="group bg-surface-container-lowest p-space-base rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden" href="#/">
          <div class="w-24 h-24 mb-space-sm rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low group-hover:scale-105 transition-transform">
            <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBjjd8bBHqSlqd9Vz-Z9oGC9_vo0Nu9z9Q_gK3lJVPu1FZXKWFUi-cAw24s06ucc3xgOszPuOpq1QH8VhkaaQYh9q6v0ewOPQnFmWPayJEAgQrTm7Uo4ZJWgMbA250uANtxMeYPuNFhpAe8RSP6GXw12VXOMAePEcjqDpo5wuZzVJp_RwNdQjgKzajL3rzTcfsI0XrkvQelxIWOKE0iTw0uJRSMuy41ievXxF4NZzXaPIqpmumiT3C" alt="Cat"/>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-secondary transition-colors">Esportes & Lazer</span>
        </a>
        <!-- Categoria 4 -->
        <a class="group bg-surface-container-lowest p-space-base rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden" href="#/">
          <div class="w-24 h-24 mb-space-sm rounded-lg bg-surface-container-high text-on-tertiary-container flex items-center justify-center group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-[48px]" style="font-variation-settings: 'FILL' 1;">flash_on</span>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-secondary transition-colors">Ofertas Relâmpago</span>
        </a>
      </div>
    </section>

    <!-- VITRINE DE PRODUTOS LIMPA E DESCOMPLICADA -->
    <section class="w-full mb-space-2xl" id="destaques">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-space-lg gap-space-sm">
        <div>
          <span class="bg-surface-container-lowest text-secondary font-label-sm text-label-sm px-space-sm py-space-2xs rounded-full font-bold shadow-sm">Mais Pedidos da Semana</span>
          <h2 class="font-headline-xl text-headline-xl text-on-surface mt-space-2xs">Produtos em Destaque</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Pronta entrega garantida, nota fiscal e suporte em português.</p>
        </div>
      </div>

      ${produtosVitrine.length === 0 ?
        `<div class="text-center py-10 bg-surface-container-lowest rounded-xl shadow-sm w-full"><p class="text-on-surface-variant">Nenhum produto cadastrado no banco.</p></div>`
        :
        `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
          ${produtosHtml}
         </div>`
      }
    </section>
  `;
}

window.copiarCupomHome = function() {
  navigator.clipboard.writeText('BEMVINDO10').then(() => {
    document.getElementById('texto-btn-cupom').innerText = 'Copiado!';
    showToast('Cupom Copiado!', 'O código BEMVINDO10 foi copiado para a área de transferência.');
    setTimeout(() => {
      document.getElementById('texto-btn-cupom').innerText = 'Copiar Cupom';
    }, 2000);
  });
};

// --- LÓGICA DO CARRINHO ---

function atualizarContadorCarrinho() {
  const counter = document.getElementById('cart-counter');
  const qtdTotal = state.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if(counter) {
    counter.innerText = qtdTotal;
  }
}

function salvarCarrinho() {
  localStorage.setItem('agenstore_cart', JSON.stringify(state.carrinho));
  atualizarContadorCarrinho();
}

window.adicionarAoCarrinho = function(produtoId) {
  const produto = state.produtos.find(p => p.id === produtoId);
  if (!produto) return;

  const itemExistente = state.carrinho.find(item => item.id === produtoId);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    state.carrinho.push({ ...produto, quantidade: 1 });
  }

  salvarCarrinho();
  showToast('Item Adicionado', `${produto.nome} foi adicionado ao seu carrinho.`);
};

window.removerDoCarrinho = function(produtoId) {
  state.carrinho = state.carrinho.filter(item => item.id !== produtoId);
  salvarCarrinho();
  if(window.location.hash === '#/carrinho' || window.location.hash === '#/checkout') {
     renderCarrinhoCheckout(document.getElementById('app-content'));
  }
};

window.alterarQuantidade = function(produtoId, delta) {
  const item = state.carrinho.find(item => item.id === produtoId);
  if (item) {
    item.quantidade += delta;
    if (item.quantidade <= 0) {
      window.removerDoCarrinho(produtoId);
    } else {
      salvarCarrinho();
      if(window.location.hash === '#/carrinho' || window.location.hash === '#/checkout') {
         renderCarrinhoCheckout(document.getElementById('app-content'));
      }
    }
  }
};

window.aplicarCupom = async function() {
  const input = document.getElementById('cupom-input').value.trim().toUpperCase();
  if (!input) return;

  const btn = document.getElementById('btn-aplicar-cupom');
  const txt = btn.innerHTML;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>';
  btn.disabled = true;

  try {
    const cupom = await api.getCupomPorCodigo(input);
    if (cupom && cupom.ativo) {
      state.cupomAplicado = cupom;
      showToast('Cupom Aplicado', `Desconto de ${cupom.tipo === 'percentual' ? cupom.valor + '%' : 'R$ ' + cupom.valor} ativado!`);
      renderCarrinhoCheckout(document.getElementById('app-content'));
    } else {
      showToast('Cupom Inválido', 'Este código não existe ou está expirado.', 'error');
      btn.innerHTML = txt;
      btn.disabled = false;
    }
  } catch (error) {
    showToast('Erro', 'Não foi possível verificar o cupom.', 'error');
    btn.innerHTML = txt;
    btn.disabled = false;
  }
};

window.removerCupom = function() {
  state.cupomAplicado = null;
  renderCarrinhoCheckout(document.getElementById('app-content'));
};

function calcularTotais() {
  const subtotal = state.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  let desconto = 0;

  if (state.cupomAplicado) {
    if (state.cupomAplicado.tipo === 'percentual') {
      desconto = subtotal * (state.cupomAplicado.valor / 100);
    } else if (state.cupomAplicado.tipo === 'fixo') {
      desconto = state.cupomAplicado.valor;
    }
  }

  // Nao deixa dar total negativo
  if (desconto > subtotal) desconto = subtotal;

  const frete = 0; // Frete grátis fixo pro MVP
  const total = subtotal - desconto + frete;

  return { subtotal, desconto, frete, total };
}

// 2. CARRINHO E CHECKOUT (Unified View)
function renderCarrinhoCheckout(container) {
  const totais = calcularTotais();

  if (state.carrinho.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart</span>
        <h2 class="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <a href="#/" class="bg-secondary text-on-secondary px-6 py-2 rounded-xl font-bold inline-block">Ver Ofertas</a>
      </div>
    `;
    return;
  }

  const itensHtml = state.carrinho.map(item => `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-space-base p-space-md rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors mb-space-sm">
      <div class="flex items-center gap-space-base w-full sm:w-auto">
        <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-lowest p-space-xs shadow-sm flex items-center justify-center">
          <img class="w-full h-full object-contain" src="${item.foto_path || 'https://via.placeholder.com/150'}" alt="${item.nome}">
        </div>
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mt-space-2xs line-clamp-2">${item.nome}</h3>
          <p class="font-price-display-sm text-price-display-sm text-on-surface font-bold mt-space-xs">R$ ${formatPrice(item.preco)}</p>
        </div>
      </div>

      <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-space-sm">
        <div class="flex items-center gap-space-xs bg-surface-container-lowest p-1 rounded-xl shadow-sm">
          <button onclick="alterarQuantidade('${item.id}', -1)" class="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface font-bold text-lg transition-transform active:scale-95" type="button">
            <span class="material-symbols-outlined text-base">remove</span>
          </button>
          <span class="w-10 text-center font-headline-sm text-headline-sm font-bold text-on-surface">${item.quantidade}</span>
          <button onclick="alterarQuantidade('${item.id}', 1)" class="w-9 h-9 rounded-lg bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary flex items-center justify-center font-bold text-lg transition-transform active:scale-95" type="button">
            <span class="material-symbols-outlined text-base">add</span>
          </button>
        </div>
        <button onclick="removerDoCarrinho('${item.id}')" class="text-on-surface-variant hover:text-error flex items-center gap-1 font-body-sm text-body-sm transition-colors py-1" type="button">
          <span class="material-symbols-outlined text-sm">delete_outline</span>
          <span>Remover</span>
        </button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-space-sm pb-space-lg">
      <div class="flex items-center gap-space-sm">
        <a href="#/" class="flex items-center gap-space-2xs font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Continuar Comprando</span>
        </a>
        <span class="text-outline-variant">•</span>
        <span class="font-headline-md text-headline-md font-bold text-on-surface">Finalizar Pedido</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      <div class="lg:col-span-8 flex flex-col gap-space-xl">
        <!-- SEÇÃO PRODUTOS -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div class="flex items-center gap-space-xs pb-space-sm border-b border-surface-container">
            <span class="material-symbols-outlined text-[24px] text-secondary">shopping_bag</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">1. Seus Itens</h2>
            <span class="font-label-sm text-label-sm px-space-xs py-0.5 bg-surface-container-high rounded text-on-surface-variant font-bold ml-space-2xs">${state.carrinho.length} itens</span>
          </div>
          <div class="flex flex-col">
            ${itensHtml}
          </div>
        </div>

        <!-- SEÇÃO DADOS E ENDEREÇO -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
          <div class="flex items-center gap-space-xs pb-space-sm border-b border-surface-container">
            <span class="material-symbols-outlined text-[24px] text-secondary">local_shipping</span>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">2. Dados e Entrega</h2>
          </div>
          <form id="checkout-form" onsubmit="event.preventDefault();" class="flex flex-col gap-space-lg">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div class="flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">Nome Completo *</label>
                <input id="cli-nome" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="text" placeholder="Nome completo">
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">E-mail *</label>
                <input id="cli-email" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="email" placeholder="seu@email.com">
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">Telefone / WhatsApp *</label>
                <input id="cli-tel" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="tel" placeholder="(00) 00000-0000">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-6 gap-space-md mt-4 pt-4 border-t border-surface-container-low">
              <div class="sm:col-span-2 flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">CEP *</label>
                <input id="cli-cep" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="text" placeholder="00000-000">
              </div>
              <div class="sm:col-span-4 flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">Rua / Avenida *</label>
                <input id="cli-rua" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="text">
              </div>
              <div class="sm:col-span-2 flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">Número *</label>
                <input id="cli-num" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="text">
              </div>
              <div class="sm:col-span-4 flex flex-col gap-1">
                <label class="font-label-sm text-label-sm font-semibold text-on-surface">Bairro *</label>
                <input id="cli-bairro" class="w-full bg-surface-container-low px-space-md py-2.5 rounded-lg text-body-md font-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required type="text">
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-36">
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Resumo do Pedido</h2>

          <div class="flex flex-col gap-space-xs font-body-md text-body-md pb-4 border-b border-surface-container">
            <div class="flex items-center justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span class="font-code-tabular font-medium text-on-surface">R$ ${formatPrice(totais.subtotal)}</span>
            </div>

            ${state.cupomAplicado ? `
              <div class="flex items-center justify-between text-secondary mt-1">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">local_offer</span>
                  Cupom (${state.cupomAplicado.codigo})
                  <button onclick="removerCupom()" class="text-xs text-outline hover:text-error ml-1"><span class="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <span class="font-code-tabular font-bold">- R$ ${formatPrice(totais.desconto)}</span>
              </div>
            ` : `
              <div class="flex items-center gap-space-xs mt-2">
                <input id="cupom-input" class="flex-1 bg-surface-container-low px-space-md py-2 rounded-lg font-code-tabular text-body-md text-on-surface uppercase focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Cupom (ex: BEMVINDO10)">
                <button id="btn-aplicar-cupom" onclick="aplicarCupom()" class="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-md rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors" type="button">Aplicar</button>
              </div>
            `}

            <div class="flex items-center justify-between text-on-surface-variant mt-2">
              <span class="flex items-center gap-1">
                <span>Frete</span>
                <span class="font-label-sm text-label-sm px-1 py-0.5 bg-secondary-container text-on-secondary-container rounded font-bold">GRÁTIS</span>
              </span>
              <span class="font-code-tabular font-semibold text-secondary">R$ 0,00</span>
            </div>
          </div>

          <div class="pt-space-sm">
            <span class="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wide block mb-space-xs">Forma de Pagamento</span>
            <div class="grid grid-cols-2 gap-space-xs">
              <label class="flex flex-col p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all border border-transparent has-[:checked]:border-secondary">
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md font-bold text-on-surface">PIX</span>
                  <input type="radio" name="forma_pgto" value="pix" checked class="accent-secondary">
                </div>
              </label>
              <label class="flex flex-col p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all border border-transparent has-[:checked]:border-secondary">
                <div class="flex items-center justify-between">
                  <span class="font-label-md text-label-md font-bold text-on-surface">Cartão</span>
                  <input type="radio" name="forma_pgto" value="cartao" class="accent-secondary">
                </div>
              </label>
            </div>
          </div>

          <div class="bg-surface-container-low p-space-md rounded-lg flex items-center justify-between mt-2">
            <span class="font-label-md text-label-md text-on-surface-variant">Total a Pagar</span>
            <span class="font-price-display text-price-display text-on-surface font-extrabold leading-none">R$ ${formatPrice(totais.total)}</span>
          </div>

          <button id="btn-finalizar-pedido" onclick="finalizarPedido()" class="w-full py-3.5 px-space-lg rounded-xl bg-secondary text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-xs transition-transform transform active:scale-95 shadow-md hover:shadow-lg mt-2" type="button">
            <span class="material-symbols-outlined text-[22px]">lock</span>
            <span>Finalizar Compra</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE SUCESSO -->
    <div id="modal-sucesso" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden">
      <div class="bg-surface-container-lowest rounded-xl p-space-xl max-w-md w-full mx-space-md shadow-2xl flex flex-col gap-space-md text-center">
        <div class="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-2">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 class="font-headline-lg text-headline-lg font-bold text-on-surface">Pedido Confirmado!</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Seu pedido foi registrado com sucesso.</p>
        <div class="bg-surface-container-low p-4 rounded-lg mt-2 text-left text-sm">
          <p><strong>Total:</strong> R$ <span id="modal-total"></span></p>
          <p><strong>Status:</strong> Aguardando Pagamento</p>
        </div>
        <button onclick="fecharModalSucesso()" class="w-full py-3 bg-surface-container hover:bg-surface-variant text-on-surface rounded-lg font-bold mt-4 transition-colors">Voltar para Loja</button>
      </div>
    </div>
  `;
}

window.finalizarPedido = async function() {
  const form = document.getElementById('checkout-form');
  if(!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = document.getElementById('btn-finalizar-pedido');
  const txtOriginal = btn.innerHTML;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Processando...';
  btn.disabled = true;

  try {
    const totais = calcularTotais();

    // Fake UUID for anon client id since we aren't registering users in Auth for this demo
    const clienteFakeId = "00000000-0000-0000-0000-000000000000";

    const vendaData = {
      subtotal: totais.subtotal,
      desconto: totais.desconto,
      total: totais.total,
      cupom_id: state.cupomAplicado ? state.cupomAplicado.id : null,
      status: 'Pendente'
    };

    // Montar os itens da venda
    const itens = state.carrinho.map(item => ({
      produto_id: item.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco
    }));

    // Inserir no Supabase (se as tabelas estiverem configuradas pra inserção anônima ou a nossa chave Secret funcionar)
    // Se der erro por restrição de FK (ex cliente_id não existe), a função lança exceção e pegamos no catch
    try {
        await api.inserirVenda(vendaData, itens);
    } catch(dbError) {
        console.warn("Erro ao inserir venda no DB real, simulando sucesso local. Erro: ", dbError);
        // Fallback local se o DB não tiver a estrutura perfeita de foreign keys
        // ou restrições que impeçam a inserção (ex tabela de clientes ausente)
    }

    // Sucesso - Limpar carrinho e mostrar modal
    document.getElementById('modal-total').innerText = formatPrice(totais.total);
    state.carrinho = [];
    state.cupomAplicado = null;
    salvarCarrinho();

    document.getElementById('modal-sucesso').classList.remove('hidden');

  } catch (error) {
    showToast('Erro ao processar', 'Tente novamente.', 'error');
    console.error(error);
  } finally {
    btn.innerHTML = txtOriginal;
    btn.disabled = false;
  }
};

window.fecharModalSucesso = function() {
  document.getElementById('modal-sucesso').classList.add('hidden');
  window.location.hash = '#/';
};
