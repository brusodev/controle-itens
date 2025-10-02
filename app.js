// ========================================
// SISTEMA DE CONTROLE DE ITENS
// ========================================

// Estrutura de Dados
let estoque = [];
let kits = [];
let requisicoes = [];
let historico = [];
let proximoIdEstoque = 1;
let proximoIdKit = 1;
let proximoIdRequisicao = 1;

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    inicializarDataAtual();
    configurarAbas();
    configurarFormularios();
    atualizarInterface();
});

function carregarDados() {
    // Carregar do LocalStorage
    const estoqueLS = localStorage.getItem('estoque');
    const kitsLS = localStorage.getItem('kits');
    const requisicoesLS = localStorage.getItem('requisicoes');
    const historicoLS = localStorage.getItem('historico');
    const idEstoqueLS = localStorage.getItem('proximoIdEstoque');
    const idKitLS = localStorage.getItem('proximoIdKit');
    const idRequisicaoLS = localStorage.getItem('proximoIdRequisicao');

    if (estoqueLS) {
        estoque = JSON.parse(estoqueLS);
        proximoIdEstoque = parseInt(idEstoqueLS) || 1;
    } else {
        // Inicializar com dados de exemplo
        inicializarEstoqueExemplo();
    }

    if (kitsLS) {
        kits = JSON.parse(kitsLS);
        proximoIdKit = parseInt(idKitLS) || 1;
    }

    if (requisicoesLS) {
        requisicoes = JSON.parse(requisicoesLS);
        proximoIdRequisicao = parseInt(idRequisicaoLS) || 1;
    }

    if (historicoLS) {
        historico = JSON.parse(historicoLS);
    }
}

function salvarDados() {
    localStorage.setItem('estoque', JSON.stringify(estoque));
    localStorage.setItem('kits', JSON.stringify(kits));
    localStorage.setItem('requisicoes', JSON.stringify(requisicoes));
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('proximoIdEstoque', proximoIdEstoque);
    localStorage.setItem('proximoIdKit', proximoIdKit);
    localStorage.setItem('proximoIdRequisicao', proximoIdRequisicao);
}

function inicializarEstoqueExemplo() {
    // Baseado no JSON fornecido
    const categorias = {
        'estrutura_e_espaco': [
            'Local do evento (salão, auditório, espaço aberto)',
            'Mesas e cadeiras',
            'Palco / púlpito',
            'Decoração (flores, banners, iluminação ambiente)',
            'Som e iluminação técnica',
            'Gerador de energia (reserva)',
            'Internet / Wi-Fi'
        ],
        'equipamentos': [
            'Microfones (sem fio e de lapela)',
            'Projetor / telão / TVs',
            'Computador / notebook de apoio',
            'Cabos, extensões e adaptadores',
            'Caixas de som',
            'Material de sinalização (placas, totens, adesivos)'
        ],
        'materiais_de_apoio': [
            'Lista de presença / credenciamento',
            'Crachás / pulseiras de identificação',
            'Kits para participantes (se houver)',
            'Papelaria (canetas, blocos, pranchetas)',
            'Brindes / lembranças'
        ]
    };

    for (let categoria in categorias) {
        categorias[categoria].forEach(nome => {
            estoque.push({
                id: proximoIdEstoque++,
                categoria: categoria,
                nome: nome,
                quantidade: 10, // Quantidade inicial padrão
                unidade: 'unidade',
                dataCadastro: new Date().toISOString()
            });
        });
    }

    salvarDados();
}

function inicializarDataAtual() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('req-data-uso').value = hoje;
}

// ========================================
// NAVEGAÇÃO POR ABAS
// ========================================

function configurarAbas() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remover active de todas as abas
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar active na aba clicada
            this.classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
            
            // Atualizar conteúdo da aba
            if (tabName === 'estoque') renderizarEstoque();
            if (tabName === 'kits') renderizarKits();
            if (tabName === 'pendentes') renderizarPendentes();
            if (tabName === 'historico') renderizarHistorico();
        });
    });
}

// ========================================
// GESTÃO DE ESTOQUE
// ========================================

function renderizarEstoque() {
    const container = document.getElementById('lista-estoque');
    const filtroCategoria = document.getElementById('filtro-categoria');
    
    // Atualizar filtro de categorias
    const categorias = [...new Set(estoque.map(item => item.categoria))];
    filtroCategoria.innerHTML = '<option value="">Todas as categorias</option>';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = formatarCategoria(cat);
        filtroCategoria.appendChild(option);
    });
    
    filtrarEstoque();
}

function filtrarEstoque() {
    const container = document.getElementById('lista-estoque');
    const busca = document.getElementById('filtro-estoque').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    
    let itensFiltrados = estoque;
    
    if (busca) {
        itensFiltrados = itensFiltrados.filter(item => 
            item.nome.toLowerCase().includes(busca)
        );
    }
    
    if (categoria) {
        itensFiltrados = itensFiltrados.filter(item => item.categoria === categoria);
    }
    
    container.innerHTML = '';
    
    if (itensFiltrados.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum item encontrado.</p>';
        return;
    }
    
    itensFiltrados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        const statusClass = item.quantidade === 0 ? 'badge-danger' : 
                           item.quantidade < 5 ? 'badge-warning' : 'badge-success';
        
        card.innerHTML = `
            <div class="item-header">
                <span class="item-categoria">${formatarCategoria(item.categoria)}</span>
                <span class="badge ${statusClass}">${item.quantidade} ${item.unidade}</span>
            </div>
            <div class="item-body">
                <h3>${item.nome}</h3>
            </div>
            <div class="item-footer">
                <button class="btn-small btn-secondary" onclick="editarItem(${item.id})">✏️ Editar</button>
                <button class="btn-small btn-danger" onclick="removerItem(${item.id})">🗑️ Remover</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function formatarCategoria(categoria) {
    const nomes = {
        'estrutura_e_espaco': 'Estrutura e Espaço',
        'equipamentos': 'Equipamentos',
        'materiais_de_apoio': 'Materiais de Apoio'
    };
    return nomes[categoria] || categoria;
}

// Modal de Item
let itemEditandoId = null;

function mostrarModalNovoItem() {
    itemEditandoId = null;
    document.getElementById('modal-titulo').textContent = 'Adicionar Item ao Estoque';
    document.getElementById('form-item').reset();
    document.getElementById('item-unidade').value = 'unidade';
    document.getElementById('modal-item').style.display = 'flex';
}

function editarItem(id) {
    const item = estoque.find(i => i.id === id);
    if (!item) return;
    
    itemEditandoId = id;
    document.getElementById('modal-titulo').textContent = 'Editar Item';
    document.getElementById('item-categoria').value = item.categoria;
    document.getElementById('item-nome').value = item.nome;
    document.getElementById('item-quantidade').value = item.quantidade;
    document.getElementById('item-unidade').value = item.unidade;
    document.getElementById('modal-item').style.display = 'flex';
}

function fecharModalItem() {
    document.getElementById('modal-item').style.display = 'none';
    itemEditandoId = null;
}

function removerItem(id) {
    if (!confirm('Deseja realmente remover este item do estoque?')) return;
    
    estoque = estoque.filter(item => item.id !== id);
    salvarDados();
    renderizarEstoque();
}

// ========================================
// NOVA REQUISIÇÃO
// ========================================

function adicionarItemRequisicao() {
    const container = document.getElementById('itens-requisicao');
    const index = container.children.length;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-requisicao';
    itemDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group flex-2">
                <label>Item *</label>
                <select class="req-item-select" required onchange="atualizarEstoqueDisponivel(this)">
                    <option value="">Selecione um item</option>
                    ${estoque.map(item => `
                        <option value="${item.id}" data-max="${item.quantidade}" data-unidade="${item.unidade}">
                            ${item.nome} (Disponível: ${item.quantidade} ${item.unidade})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantidade *</label>
                <input type="number" class="req-item-qtd" min="1" required>
            </div>
            <div class="form-group form-group-btn">
                <button type="button" class="btn-small btn-danger" onclick="removerItemRequisicao(this)">🗑️</button>
            </div>
        </div>
        <small class="estoque-info"></small>
    `;
    
    container.appendChild(itemDiv);
}

function removerItemRequisicao(btn) {
    btn.closest('.item-requisicao').remove();
}

function atualizarEstoqueDisponivel(select) {
    const itemDiv = select.closest('.item-requisicao');
    const info = itemDiv.querySelector('.estoque-info');
    const qtdInput = itemDiv.querySelector('.req-item-qtd');
    
    const option = select.options[select.selectedIndex];
    const max = parseInt(option.getAttribute('data-max')) || 0;
    const unidade = option.getAttribute('data-unidade') || 'unidade';
    
    qtdInput.max = max;
    qtdInput.value = Math.min(1, max);
    
    if (max === 0) {
        info.textContent = '⚠️ Item sem estoque disponível';
        info.style.color = '#dc3545';
        qtdInput.disabled = true;
    } else if (max < 5) {
        info.textContent = `⚠️ Estoque baixo: apenas ${max} ${unidade} disponível(is)`;
        info.style.color = '#ff9800';
        qtdInput.disabled = false;
    } else {
        info.textContent = `✓ ${max} ${unidade} disponível(is)`;
        info.style.color = '#28a745';
        qtdInput.disabled = false;
    }
}

// ========================================
// FORMULÁRIOS
// ========================================

function configurarFormularios() {
    // Form: Adicionar/Editar Item
    document.getElementById('form-item').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dados = {
            categoria: document.getElementById('item-categoria').value,
            nome: document.getElementById('item-nome').value,
            quantidade: parseInt(document.getElementById('item-quantidade').value),
            unidade: document.getElementById('item-unidade').value
        };
        
        if (itemEditandoId) {
            // Editar
            const item = estoque.find(i => i.id === itemEditandoId);
            Object.assign(item, dados);
        } else {
            // Adicionar
            estoque.push({
                id: proximoIdEstoque++,
                ...dados,
                dataCadastro: new Date().toISOString()
            });
        }
        
        salvarDados();
        fecharModalItem();
        renderizarEstoque();
    });
    
    // Form: Nova Requisição
    document.getElementById('form-requisicao').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itensReq = [];
        const itensDiv = document.querySelectorAll('.item-requisicao');
        
        if (itensDiv.length === 0) {
            alert('Adicione pelo menos um item à requisição.');
            return;
        }
        
        let valid = true;
        itensDiv.forEach(div => {
            const select = div.querySelector('.req-item-select');
            const qtdInput = div.querySelector('.req-item-qtd');
            
            // Verificar se os elementos existem
            if (!select || !qtdInput) {
                valid = false;
                return;
            }
            
            const itemId = parseInt(select.value);
            const qtd = parseInt(qtdInput.value);
            
            if (!itemId || !qtd) {
                valid = false;
                return;
            }
            
            const item = estoque.find(i => i.id === itemId);
            
            if (!item) {
                alert('Item não encontrado no estoque.');
                valid = false;
                return;
            }
            
            if (qtd > item.quantidade) {
                alert(`Quantidade solicitada de "${item.nome}" excede o estoque disponível.`);
                valid = false;
                return;
            }
            
            itensReq.push({
                itemId: itemId,
                itemNome: item.nome,
                quantidade: qtd,
                unidade: item.unidade
            });
        });
        
        if (!valid) return;
        
        const requisicao = {
            id: proximoIdRequisicao++,
            solicitante: document.getElementById('req-solicitante').value,
            recebedor: document.getElementById('req-recebedor').value,
            dataUso: document.getElementById('req-data-uso').value,
            observacao: document.getElementById('req-observacao').value,
            itens: itensReq,
            status: 'pendente',
            dataSolicitacao: new Date().toISOString()
        };
        
        requisicoes.push(requisicao);
        salvarDados();
        
        alert('Requisição enviada com sucesso! Aguarde aprovação.');
        this.reset();
        document.getElementById('itens-requisicao').innerHTML = '';
        inicializarDataAtual();
        
        atualizarInterface();
    });
    
    // Form: Criar/Editar Kit
    document.getElementById('form-kit').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itensKitDiv = document.querySelectorAll('#itens-kit .item-requisicao');
        
        if (itensKitDiv.length === 0) {
            alert('Adicione pelo menos um item ao kit.');
            return;
        }
        
        const itensKit = [];
        let valid = true;
        
        itensKitDiv.forEach(div => {
            const select = div.querySelector('.kit-item-select');
            const qtdInput = div.querySelector('.kit-item-qtd');
            
            // Verificar se os elementos existem
            if (!select || !qtdInput) {
                valid = false;
                return;
            }
            
            const itemId = parseInt(select.value);
            const qtd = parseInt(qtdInput.value);
            
            if (!itemId || !qtd) {
                valid = false;
                return;
            }
            
            const item = estoque.find(i => i.id === itemId);
            
            if (!item) {
                alert('Item não encontrado no estoque.');
                valid = false;
                return;
            }
            
            itensKit.push({
                itemId: itemId,
                itemNome: item.nome,
                quantidade: qtd,
                unidade: item.unidade
            });
        });
        
        if (!valid) {
            alert('Preencha todos os campos do kit.');
            return;
        }
        
        const dadosKit = {
            nome: document.getElementById('kit-nome').value,
            descricao: document.getElementById('kit-descricao').value,
            itens: itensKit
        };
        
        if (kitEditandoId) {
            // Editar kit existente
            const kit = kits.find(k => k.id === kitEditandoId);
            Object.assign(kit, dadosKit);
        } else {
            // Criar novo kit
            kits.push({
                id: proximoIdKit++,
                ...dadosKit,
                dataCriacao: new Date().toISOString()
            });
        }
        
        salvarDados();
        fecharModalKit();
        alert('Kit salvo com sucesso!');
        atualizarInterface();
    });
}

// ========================================
// REQUISIÇÕES PENDENTES
// ========================================

function renderizarPendentes() {
    const container = document.getElementById('lista-pendentes');
    const pendentes = requisicoes.filter(r => r.status === 'pendente');
    
    container.innerHTML = '';
    
    if (pendentes.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma requisição pendente.</p>';
        return;
    }
    
    pendentes.forEach(req => {
        const card = document.createElement('div');
        card.className = 'requisicao-card';
        
        card.innerHTML = `
            <div class="req-header">
                <div>
                    <strong>Requisição #${req.id}</strong>
                    <span class="badge badge-warning">Pendente</span>
                </div>
                <small>${formatarData(req.dataSolicitacao)}</small>
            </div>
            <div class="req-body">
                <p><strong>Solicitante:</strong> ${req.solicitante}</p>
                <p><strong>Recebedor:</strong> ${req.recebedor}</p>
                <p><strong>Data de uso:</strong> ${formatarDataSimples(req.dataUso)}</p>
                <p><strong>Itens:</strong> ${req.itens.length} item(ns)</p>
                ${req.observacao ? `<p><strong>Obs:</strong> ${req.observacao}</p>` : ''}
            </div>
            <div class="req-footer">
                <button class="btn-small btn-secondary" onclick="verDetalhesRequisicao(${req.id})">👁️ Detalhes</button>
                <button class="btn-small btn-success" onclick="aprovarRequisicao(${req.id})">✓ Aprovar</button>
                <button class="btn-small btn-danger" onclick="rejeitarRequisicao(${req.id})">✗ Rejeitar</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function verDetalhesRequisicao(id) {
    const req = requisicoes.find(r => r.id === id);
    if (!req) return;
    
    const detalhes = document.getElementById('detalhes-requisicao');
    
    detalhes.innerHTML = `
        <h2>Requisição #${req.id}</h2>
        <div class="detalhes-grid">
            <div class="detalhe-item">
                <strong>Status:</strong>
                <span class="badge badge-${req.status === 'pendente' ? 'warning' : req.status === 'aprovada' ? 'success' : 'danger'}">
                    ${req.status.toUpperCase()}
                </span>
            </div>
            <div class="detalhe-item">
                <strong>Solicitante:</strong> ${req.solicitante}
            </div>
            <div class="detalhe-item">
                <strong>Recebedor:</strong> ${req.recebedor}
            </div>
            <div class="detalhe-item">
                <strong>Data de Uso:</strong> ${formatarDataSimples(req.dataUso)}
            </div>
            <div class="detalhe-item">
                <strong>Data de Solicitação:</strong> ${formatarData(req.dataSolicitacao)}
            </div>
            ${req.dataAprovacao ? `
                <div class="detalhe-item">
                    <strong>Data de ${req.status === 'aprovada' ? 'Aprovação' : 'Rejeição'}:</strong> 
                    ${formatarData(req.dataAprovacao)}
                </div>
            ` : ''}
            ${req.aprovadoPor ? `
                <div class="detalhe-item">
                    <strong>${req.status === 'aprovada' ? 'Aprovado' : 'Rejeitado'} por:</strong> 
                    ${req.aprovadoPor}
                </div>
            ` : ''}
        </div>
        
        ${req.observacao ? `
            <div class="detalhe-item-full">
                <strong>Observações:</strong>
                <p>${req.observacao}</p>
            </div>
        ` : ''}
        
        ${req.motivoRejeicao ? `
            <div class="detalhe-item-full alert-danger">
                <strong>Motivo da Rejeição:</strong>
                <p>${req.motivoRejeicao}</p>
            </div>
        ` : ''}
        
        <h3>Itens Solicitados</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Estoque Atual</th>
                </tr>
            </thead>
            <tbody>
                ${req.itens.map(item => {
                    const estoqueItem = estoque.find(e => e.id === item.itemId);
                    const qtdDisponivel = estoqueItem ? estoqueItem.quantidade : 0;
                    return `
                        <tr>
                            <td>${item.itemNome}</td>
                            <td>${item.quantidade} ${item.unidade}</td>
                            <td>${qtdDisponivel} ${item.unidade}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('modal-requisicao').style.display = 'flex';
}

function fecharModalRequisicao() {
    document.getElementById('modal-requisicao').style.display = 'none';
}

function aprovarRequisicao(id) {
    const req = requisicoes.find(r => r.id === id);
    if (!req) return;
    
    // Verificar se há estoque suficiente
    for (let item of req.itens) {
        const estoqueItem = estoque.find(e => e.id === item.itemId);
        if (!estoqueItem || estoqueItem.quantidade < item.quantidade) {
            alert(`Estoque insuficiente para "${item.itemNome}". Requisição não pode ser aprovada.`);
            return;
        }
    }
    
    const aprovador = prompt('Digite seu nome para confirmar a aprovação:');
    if (!aprovador) return;
    
    // Dar baixa no estoque
    req.itens.forEach(item => {
        const estoqueItem = estoque.find(e => e.id === item.itemId);
        estoqueItem.quantidade -= item.quantidade;
    });
    
    // Atualizar requisição
    req.status = 'aprovada';
    req.dataAprovacao = new Date().toISOString();
    req.aprovadoPor = aprovador;
    
    // Adicionar ao histórico
    historico.push({
        id: Date.now(),
        tipo: 'aprovacao',
        requisicaoId: req.id,
        ...req,
        dataHistorico: new Date().toISOString()
    });
    
    salvarDados();
    alert('Requisição aprovada! Estoque atualizado.');
    atualizarInterface();
}

function rejeitarRequisicao(id) {
    const motivo = prompt('Digite o motivo da rejeição:');
    if (!motivo) return;
    
    const aprovador = prompt('Digite seu nome para confirmar a rejeição:');
    if (!aprovador) return;
    
    const req = requisicoes.find(r => r.id === id);
    if (!req) return;
    
    req.status = 'rejeitada';
    req.dataAprovacao = new Date().toISOString();
    req.aprovadoPor = aprovador;
    req.motivoRejeicao = motivo;
    
    // Adicionar ao histórico
    historico.push({
        id: Date.now(),
        tipo: 'rejeicao',
        requisicaoId: req.id,
        ...req,
        dataHistorico: new Date().toISOString()
    });
    
    salvarDados();
    alert('Requisição rejeitada.');
    atualizarInterface();
}

// ========================================
// HISTÓRICO
// ========================================

function renderizarHistorico() {
    const container = document.getElementById('lista-historico');
    filtrarHistorico();
}

function filtrarHistorico() {
    const container = document.getElementById('lista-historico');
    const busca = document.getElementById('filtro-historico').value.toLowerCase();
    const status = document.getElementById('filtro-status').value;
    
    let itensFiltrados = requisicoes.filter(r => r.status !== 'pendente');
    
    if (busca) {
        itensFiltrados = itensFiltrados.filter(r => 
            r.solicitante.toLowerCase().includes(busca) ||
            r.recebedor.toLowerCase().includes(busca) ||
            r.id.toString().includes(busca)
        );
    }
    
    if (status) {
        itensFiltrados = itensFiltrados.filter(r => r.status === status);
    }
    
    // Ordenar por data (mais recente primeiro)
    itensFiltrados.sort((a, b) => new Date(b.dataAprovacao) - new Date(a.dataAprovacao));
    
    container.innerHTML = '';
    
    if (itensFiltrados.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum registro encontrado.</p>';
        return;
    }
    
    itensFiltrados.forEach(req => {
        const card = document.createElement('div');
        card.className = 'historico-item';
        
        const badgeClass = req.status === 'aprovada' ? 'badge-success' : 'badge-danger';
        
        card.innerHTML = `
            <div class="historico-header">
                <div>
                    <strong>Requisição #${req.id}</strong>
                    <span class="badge ${badgeClass}">${req.status.toUpperCase()}</span>
                </div>
                <small>${formatarData(req.dataAprovacao)}</small>
            </div>
            <div class="historico-body">
                <div class="historico-info">
                    <p><strong>Solicitante:</strong> ${req.solicitante}</p>
                    <p><strong>Recebedor:</strong> ${req.recebedor}</p>
                    <p><strong>Data de uso:</strong> ${formatarDataSimples(req.dataUso)}</p>
                </div>
                <div class="historico-info">
                    <p><strong>${req.status === 'aprovada' ? 'Aprovado' : 'Rejeitado'} por:</strong> ${req.aprovadoPor}</p>
                    <p><strong>Itens:</strong> ${req.itens.length} item(ns)</p>
                </div>
            </div>
            <div class="historico-footer">
                <button class="btn-small btn-secondary" onclick="verDetalhesRequisicao(${req.id})">👁️ Ver Detalhes</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ========================================
// UTILIDADES
// ========================================

function atualizarInterface() {
    // Atualizar badge de pendentes
    const pendentes = requisicoes.filter(r => r.status === 'pendente').length;
    document.getElementById('badge-pendentes').textContent = pendentes;
    
    // Atualizar select de kits na requisição
    atualizarSelectKits();
    
    // Atualizar aba ativa
    const abaAtiva = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    if (abaAtiva === 'estoque') renderizarEstoque();
    if (abaAtiva === 'kits') renderizarKits();
    if (abaAtiva === 'pendentes') renderizarPendentes();
    if (abaAtiva === 'historico') renderizarHistorico();
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarDataSimples(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

// ========================================
// GESTÃO DE KITS
// ========================================

function renderizarKits() {
    filtrarKits();
}

function filtrarKits() {
    const container = document.getElementById('lista-kits');
    const busca = document.getElementById('filtro-kits').value.toLowerCase();
    
    let kitsFiltrados = kits;
    
    if (busca) {
        kitsFiltrados = kitsFiltrados.filter(kit => 
            kit.nome.toLowerCase().includes(busca) ||
            (kit.descricao && kit.descricao.toLowerCase().includes(busca))
        );
    }
    
    container.innerHTML = '';
    
    if (kitsFiltrados.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum kit encontrado. Crie seu primeiro kit!</p>';
        return;
    }
    
    kitsFiltrados.forEach(kit => {
        const card = document.createElement('div');
        card.className = 'item-card kit-card';
        
        const totalItens = kit.itens.length;
        
        card.innerHTML = `
            <div class="item-header">
                <span class="item-categoria">🎁 KIT</span>
                <span class="badge badge-success">${totalItens} ${totalItens === 1 ? 'item' : 'itens'}</span>
            </div>
            <div class="item-body">
                <h3>${kit.nome}</h3>
                ${kit.descricao ? `<p class="kit-descricao">${kit.descricao}</p>` : ''}
            </div>
            <div class="item-footer">
                <button class="btn-small btn-secondary" onclick="verDetalhesKit(${kit.id})">👁️ Ver</button>
                <button class="btn-small btn-secondary" onclick="editarKit(${kit.id})">✏️ Editar</button>
                <button class="btn-small btn-danger" onclick="removerKit(${kit.id})">🗑️ Remover</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Modal de Kit
let kitEditandoId = null;

function mostrarModalNovoKit() {
    kitEditandoId = null;
    document.getElementById('modal-kit-titulo').textContent = 'Criar Novo Kit';
    document.getElementById('form-kit').reset();
    document.getElementById('itens-kit').innerHTML = '';
    document.getElementById('modal-kit').style.display = 'flex';
    
    // Adicionar primeiro item automaticamente
    adicionarItemKit();
}

function editarKit(id) {
    const kit = kits.find(k => k.id === id);
    if (!kit) return;
    
    kitEditandoId = id;
    document.getElementById('modal-kit-titulo').textContent = 'Editar Kit';
    document.getElementById('kit-nome').value = kit.nome;
    document.getElementById('kit-descricao').value = kit.descricao || '';
    
    // Limpar e adicionar itens do kit
    const container = document.getElementById('itens-kit');
    container.innerHTML = '';
    
    kit.itens.forEach(item => {
        adicionarItemKit(item.itemId, item.quantidade);
    });
    
    document.getElementById('modal-kit').style.display = 'flex';
}

function fecharModalKit() {
    document.getElementById('modal-kit').style.display = 'none';
    kitEditandoId = null;
}

function adicionarItemKit(itemIdPreSelecionado = null, quantidadePreSelecionada = 1) {
    const container = document.getElementById('itens-kit');
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-requisicao';
    itemDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group flex-2">
                <label>Item *</label>
                <select class="kit-item-select" required>
                    <option value="">Selecione um item</option>
                    ${estoque.map(item => `
                        <option value="${item.id}" ${itemIdPreSelecionado === item.id ? 'selected' : ''}>
                            ${item.nome}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantidade *</label>
                <input type="number" class="kit-item-qtd" min="1" value="${quantidadePreSelecionada}" required>
            </div>
            <div class="form-group form-group-btn">
                <button type="button" class="btn-small btn-danger" onclick="removerItemKit(this)">🗑️</button>
            </div>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

function removerItemKit(btn) {
    btn.closest('.item-requisicao').remove();
}

function removerKit(id) {
    if (!confirm('Deseja realmente remover este kit?')) return;
    
    kits = kits.filter(kit => kit.id !== id);
    salvarDados();
    renderizarKits();
}

function verDetalhesKit(id) {
    const kit = kits.find(k => k.id === id);
    if (!kit) return;
    
    const container = document.getElementById('conteudo-detalhes-kit');
    
    let html = `
        <h2>🎁 ${kit.nome}</h2>
        ${kit.descricao ? `<p class="kit-descricao-detalhes">${kit.descricao}</p>` : ''}
        
        <h3>Itens do Kit</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Estoque Atual</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    kit.itens.forEach(item => {
        const estoqueItem = estoque.find(e => e.id === item.itemId);
        if (estoqueItem) {
            const statusClass = estoqueItem.quantidade >= item.quantidade ? 'badge-success' : 'badge-danger';
            html += `
                <tr>
                    <td>${item.itemNome}</td>
                    <td>${item.quantidade} ${item.unidade}</td>
                    <td><span class="badge ${statusClass}">${estoqueItem.quantidade} ${item.unidade}</span></td>
                </tr>
            `;
        }
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    document.getElementById('modal-detalhes-kit').style.display = 'flex';
}

function fecharModalDetalhesKit() {
    document.getElementById('modal-detalhes-kit').style.display = 'none';
}

// Atualizar select de kits na requisição
function atualizarSelectKits() {
    const select = document.getElementById('select-kit');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um kit</option>';
    
    kits.forEach(kit => {
        const option = document.createElement('option');
        option.value = kit.id;
        option.textContent = `${kit.nome} (${kit.itens.length} ${kit.itens.length === 1 ? 'item' : 'itens'})`;
        select.appendChild(option);
    });
}

// Adicionar kit na requisição
function adicionarKitNaRequisicao() {
    const selectKit = document.getElementById('select-kit');
    const kitId = parseInt(selectKit.value);
    
    if (!kitId) {
        alert('Selecione um kit primeiro.');
        return;
    }
    
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    
    // Verificar se há estoque suficiente para todos os itens do kit
    let estoqueInsuficiente = false;
    kit.itens.forEach(item => {
        const estoqueItem = estoque.find(e => e.id === item.itemId);
        if (!estoqueItem || estoqueItem.quantidade < item.quantidade) {
            estoqueInsuficiente = true;
        }
    });
    
    if (estoqueInsuficiente) {
        if (!confirm('ATENÇÃO: Alguns itens do kit não possuem estoque suficiente. Deseja adicionar mesmo assim?')) {
            return;
        }
    }
    
    // Adicionar todos os itens do kit
    kit.itens.forEach(item => {
        const container = document.getElementById('itens-requisicao');
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-requisicao';
        itemDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group flex-2">
                    <label>Item *</label>
                    <select class="req-item-select" required onchange="atualizarEstoqueDisponivel(this)">
                        <option value="">Selecione um item</option>
                        ${estoque.map(e => `
                            <option value="${e.id}" data-max="${e.quantidade}" data-unidade="${e.unidade}" ${e.id === item.itemId ? 'selected' : ''}>
                                ${e.nome} (Disponível: ${e.quantidade} ${e.unidade})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantidade *</label>
                    <input type="number" class="req-item-qtd" min="1" value="${item.quantidade}" required>
                </div>
                <div class="form-group form-group-btn">
                    <button type="button" class="btn-small btn-danger" onclick="removerItemRequisicao(this)">🗑️</button>
                </div>
            </div>
            <small class="estoque-info"></small>
        `;
        
        container.appendChild(itemDiv);
        
        // Atualizar info de estoque
        const select = itemDiv.querySelector('.req-item-select');
        atualizarEstoqueDisponivel(select);
    });
    
    // Resetar select do kit
    selectKit.value = '';
    
    alert(`Kit "${kit.nome}" adicionado com ${kit.itens.length} ${kit.itens.length === 1 ? 'item' : 'itens'}!`);
}

// Fechar modais ao clicar fora
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}
