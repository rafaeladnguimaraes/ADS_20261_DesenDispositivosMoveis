const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

function toggleGaleria(elementoClicado) {
    elementoClicado.classList.toggle('active');
    const galeriaFotos = elementoClicado.nextElementSibling;
    if (galeriaFotos) {
        galeriaFotos.classList.toggle('show');
    }
}

const CARRINHO_KEY = 'alola_carrinho';

function obterCarrinho() {
    try {
        return JSON.parse(localStorage.getItem(CARRINHO_KEY)) || [];
    } catch {
        return [];
    }
}

function salvarCarrinho(itens) {
    localStorage.setItem(CARRINHO_KEY, JSON.stringify(itens));
}

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function atualizarBadgeCarrinho() {
    const badge = document.getElementById('carrinho-badge');
    if (!badge) return;
    const totalItens = obterCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
    badge.textContent = totalItens;
    badge.style.display = totalItens > 0 ? 'inline-flex' : 'none';
}

function renderizarCarrinho() {
    const lista = document.getElementById('carrinho-lista');
    const vazio = document.getElementById('carrinho-vazio');
    const totalEl = document.getElementById('carrinho-total');
    if (!lista || !vazio || !totalEl) return;

    const itens = obterCarrinho();
    lista.innerHTML = '';

    if (itens.length === 0) {
        vazio.style.display = 'block';
        totalEl.textContent = formatarPreco(0);
        return;
    }

    vazio.style.display = 'none';
    let total = 0;

    itens.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const li = document.createElement('li');
        li.className = 'carrinho-item';
        li.innerHTML = `
            <div class="carrinho-item-info">
                <strong>${item.nome}</strong>
                <span>${formatarPreco(item.preco)} × ${item.quantidade}</span>
            </div>
            <div class="carrinho-item-acoes">
                <button class="btn-qtd" data-index="${index}" data-acao="menos" aria-label="Diminuir quantidade">−</button>
                <span>${item.quantidade}</span>
                <button class="btn-qtd" data-index="${index}" data-acao="mais" aria-label="Aumentar quantidade">+</button>
                <button class="btn-remover" data-index="${index}" aria-label="Remover item">✕</button>
            </div>
        `;
        lista.appendChild(li);
    });

    totalEl.textContent = formatarPreco(total);
}

function adicionarAoCarrinho(nome, preco) {
    const itens = obterCarrinho();
    const existente = itens.find(item => item.nome === nome);

    if (existente) {
        existente.quantidade += 1;
    } else {
        itens.push({ nome, preco: parseFloat(preco), quantidade: 1 });
    }

    salvarCarrinho(itens);
    atualizarBadgeCarrinho();
    renderizarCarrinho();
    mostrarToast(`${nome} adicionado ao carrinho!`);
}

function alterarQuantidade(index, acao) {
    const itens = obterCarrinho();
    if (!itens[index]) return;

    if (acao === 'mais') {
        itens[index].quantidade += 1;
    } else if (acao === 'menos') {
        itens[index].quantidade -= 1;
        if (itens[index].quantidade <= 0) {
            itens.splice(index, 1);
        }
    }

    salvarCarrinho(itens);
    atualizarBadgeCarrinho();
    renderizarCarrinho();
}

function removerDoCarrinho(index) {
    const itens = obterCarrinho();
    itens.splice(index, 1);
    salvarCarrinho(itens);
    atualizarBadgeCarrinho();
    renderizarCarrinho();
}

function abrirCarrinho() {
    const panel = document.getElementById('carrinho-panel');
    const overlay = document.getElementById('carrinho-overlay');
    if (!panel || !overlay) return;
    renderizarCarrinho();
    panel.classList.add('open');
    overlay.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
}

function fecharCarrinho() {
    const panel = document.getElementById('carrinho-panel');
    const overlay = document.getElementById('carrinho-overlay');
    if (!panel || !overlay) return;
    panel.classList.remove('open');
    overlay.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
}

function inicializarCarrinho() {
    atualizarBadgeCarrinho();
    renderizarCarrinho();

    document.querySelectorAll('.btn-adicionar-carrinho').forEach(btn => {
        btn.addEventListener('click', () => {
            adicionarAoCarrinho(btn.dataset.nome, btn.dataset.preco);
        });
    });

    const btnAbrir = document.getElementById('btn-abrir-carrinho');
    const btnFechar = document.getElementById('btn-fechar-carrinho');
    const overlay = document.getElementById('carrinho-overlay');
    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    const lista = document.getElementById('carrinho-lista');

    if (btnAbrir) btnAbrir.addEventListener('click', abrirCarrinho);
    if (btnFechar) btnFechar.addEventListener('click', fecharCarrinho);
    if (overlay) overlay.addEventListener('click', fecharCarrinho);

    if (lista) {
        lista.addEventListener('click', (e) => {
            const btnQtd = e.target.closest('.btn-qtd');
            const btnRemover = e.target.closest('.btn-remover');

            if (btnQtd) {
                alterarQuantidade(parseInt(btnQtd.dataset.index), btnQtd.dataset.acao);
            }
            if (btnRemover) {
                removerDoCarrinho(parseInt(btnRemover.dataset.index));
            }
        });
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            const itens = obterCarrinho();
            if (itens.length === 0) {
                mostrarToast('Adicione produtos antes de finalizar.');
                return;
            }
            const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
            salvarCarrinho([]);
            atualizarBadgeCarrinho();
            renderizarCarrinho();
            fecharCarrinho();
            mostrarToast(`Compra simulada! Total: ${formatarPreco(total)}. Obrigado!`);
        });
    }
}

function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function limparErrosFormulario() {
    document.querySelectorAll('.erro-campo').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('#form-contato input, #form-contato textarea, #form-contato select').forEach(el => {
        el.classList.remove('campo-invalido');
    });
}

function mostrarErro(campoId, mensagem) {
    const erroEl = document.getElementById(`erro-${campoId}`);
    const campo = document.getElementById(campoId);
    if (erroEl) erroEl.textContent = mensagem;
    if (campo) campo.classList.add('campo-invalido');
}

function validarFormularioContato() {
    limparErrosFormulario();

    const nome = document.getElementById('nome');
    const telefone = document.getElementById('telefone');
    const email = document.getElementById('email');
    const assunto = document.getElementById('assunto');
    const mensagem = document.getElementById('mensagem');

    if (!nome || !telefone || !email || !assunto || !mensagem) return false;

    let valido = true;

    if (nome.value.trim().length < 3) {
        mostrarErro('nome', 'Informe seu nome completo (mínimo 3 caracteres).');
        valido = false;
    }

    if (!validarTelefone(telefone.value)) {
        mostrarErro('telefone', 'Informe um telefone válido com DDD (10 ou 11 dígitos).');
        valido = false;
    }

    if (!validarEmail(email.value.trim())) {
        mostrarErro('email', 'Informe um e-mail válido.');
        valido = false;
    }

    if (!assunto.value) {
        mostrarErro('assunto', 'Selecione um assunto.');
        valido = false;
    }

    if (mensagem.value.trim().length < 10) {
        mostrarErro('mensagem', 'A mensagem deve ter pelo menos 10 caracteres.');
        valido = false;
    }

    return valido;
}

function inicializarFormularioContato() {
    const form = document.getElementById('form-contato');
    if (!form) return;

    const telefone = document.getElementById('telefone');
    if (telefone) {
        telefone.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);

            if (valor.length > 6) {
                valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (valor.length > 2) {
                valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (valor.length > 0) {
                valor = valor.replace(/^(\d*)/, '($1');
            }

            e.target.value = valor;
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sucesso = document.getElementById('form-sucesso');
        if (sucesso) sucesso.hidden = true;

        if (!validarFormularioContato()) return;

        form.reset();
        if (sucesso) sucesso.hidden = false;
        mostrarToast('Mensagem enviada com sucesso! (Simulação)');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrinho();
    inicializarFormularioContato();
});
