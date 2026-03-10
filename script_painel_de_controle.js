// Cria o canal de broadcast globalmente
const canal = new BroadcastChannel('painel_exibicao');

// Inicializa os módulos dependendo da página carregada
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('painel-switchlowerthird')) {
    initPainelPrincipal();
    initSlotsMemoria();
    initBancoDeDados();
  }
  if (document.getElementById('cor_principal')) {
    initConfiguracaoCores();
  }
  initVersao();
  initEasterEgg();
});

function initPainelPrincipal() {
  const sentidoSwitch = document.getElementById('painel-switchlowerthird');
  const nome = document.getElementById('nome');
  const info = document.getElementById('info');
  const temaSelect = document.getElementById('tema-select');
  const testSwitch = document.getElementById('painel-switchteste');

  // Desliga automático após 8 segundos quando ativado
  let sentidoAutoOffTimer = null;

  sentidoSwitch.addEventListener('change', function() {
    // Validação de tema
    if (sentidoSwitch.checked && (!temaSelect.value || temaSelect.value === 'vazio')) {
      alert('Por favor, selecione um tema.');
      sentidoSwitch.checked = false;
      return;
    }

    if (sentidoSwitch.checked && temaSelect.value !== 'vazio') {
      canal.postMessage({
        acao: 'mostrarLowerthird',
        nome: nome.value,
        info: info.value
      });

      if (temaSelect.value === 'teste') {
        canal.postMessage({ acao: 'test', ligado: true });
      }

      // limpa timer anterior (evita múltiplos)
      if (sentidoAutoOffTimer) {
        clearTimeout(sentidoAutoOffTimer);
      }
      sentidoAutoOffTimer = setTimeout(() => {
        sentidoSwitch.checked = false;
        canal.postMessage({ acao: 'esconderLowerthird' });
        // garante que o vídeo também seja desligado no auto-off
        canal.postMessage({ acao: 'test', ligado: false });
        sentidoAutoOffTimer = null;
      }, 8000); // 8000 ms = 8 segundos

    } else {
      // se desligou manualmente, cancela timer e esconde
      if (sentidoAutoOffTimer) {
        clearTimeout(sentidoAutoOffTimer);
        sentidoAutoOffTimer = null;
      }
      canal.postMessage({ acao: 'esconderLowerthird' });
      // envia também para desligar o vídeo quando o switch de transmissão for desligado
      canal.postMessage({ acao: 'test', ligado: false });
    }
  });

  // Atualização em tempo real ao digitar
  nome.addEventListener('input', function() {
    if (sentidoSwitch.checked) {
      canal.postMessage({
        acao: 'mostrarLowerthird',
        nome: nome.value,
        info: info.value
      });
    }
  });

  info.addEventListener('input', function() {
    if (sentidoSwitch.checked) {
      canal.postMessage({
        acao: 'mostrarLowerthird',
        nome: nome.value,
        info: info.value
      });
    }
  });

  temaSelect.addEventListener('change', function() {
    canal.postMessage({ acao: 'alterarTema', tema: temaSelect.value });
  });

  // Switch de teste: envia ação 'test' com estado ligado (true/false)
  if (testSwitch) {
    testSwitch.addEventListener('change', function() {
      canal.postMessage({ acao: 'test', ligado: testSwitch.checked });
    });
  }
}

function initSlotsMemoria() {
  const nome = document.getElementById('nome');
  const info = document.getElementById('info');
  const botaoSlots = document.querySelectorAll('.botao-salvo');

  // Cada slot guarda { nome, info } em memória e também em localStorage (para persistir entre sessões).
  const slots = {};
  for (let i = 1; i <= 8; i++) {
    const raw = localStorage.getItem(`slot_${i}`);
    slots[i] = raw ? JSON.parse(raw) : { nome: '', info: '' };
  }

  let activeSlot = null;

  // atualiza o title (tooltip) de todos os botões com o nome salvo (ou "Vazio")
  function updateButtonTitles() {
    botaoSlots.forEach(b => {
      const slot = b.getAttribute('data-slot');
      const data = slots[slot] || { nome: '', info: '' };
      b.title = data.nome ? data.nome : 'Vazio';
    });
  }

  function setActiveButton(slot) {
    activeSlot = String(slot);
    // atualiza classe visual
    botaoSlots.forEach(b => b.classList.toggle('ativo', b.getAttribute('data-slot') === activeSlot));
    // carregar valores da "variável" para os campos
    nome.value = slots[activeSlot].nome || '';
    info.value = slots[activeSlot].info || '';
    // persistir qual slot está ativo
    localStorage.setItem('active_slot', activeSlot);
    // atualizar tooltips (caso tenham mudado)
    updateButtonTitles();
  }

  // ao clicar em um botão numerado, torna-o ativo e carrega seus valores
  botaoSlots.forEach(b => {
    const slot = b.getAttribute('data-slot');
    b.addEventListener('click', () => {
      setActiveButton(slot);
    });
  });

  // atualiza a variável do slot ativo sempre que os campos forem editados
  function updateActiveSlotFromFields() {
    if (!activeSlot) return;
    slots[activeSlot].nome = nome.value;
    slots[activeSlot].info = info.value;
    // salva no localStorage para persistência
    localStorage.setItem(`slot_${activeSlot}`, JSON.stringify(slots[activeSlot]));
    // atualizar tooltip do botão ativo
    const btn = document.querySelector(`.botao-salvo[data-slot="${activeSlot}"]`);
    if (btn) btn.title = slots[activeSlot].nome ? slots[activeSlot].nome : 'Vazio';
  }

  nome.addEventListener('input', updateActiveSlotFromFields);
  info.addEventListener('input', updateActiveSlotFromFields);

  // ao carregar a página, atualiza títulos e reaplica o slot ativo salvo (se houver)
  updateButtonTitles();
  const persistedActive = localStorage.getItem('active_slot');
  if (persistedActive && slots[persistedActive]) {
    setActiveButton(persistedActive);
  }
}

function initConfiguracaoCores() {
  const corPrincipal = document.getElementById('cor_principal');
  const texto1 = document.getElementById('texto1');
  const corSecundaria = document.getElementById('cor_secundaria');
  const texto2 = document.getElementById('texto2');
  const btnAplicar = document.getElementById('btn-aplicar');
  const btnSalvarCores = document.getElementById('btn-salvar-cores');
  const previewTitle = document.getElementById('preview-title');
  const previewSub = document.getElementById('preview-sub');

  function buildColors() {
    return {
      cor_principal: corPrincipal ? corPrincipal.value : null,
      texto1: texto1 ? texto1.value : null,
      cor_secundaria: corSecundaria ? corSecundaria.value : null,
      texto2: texto2 ? texto2.value : null
    };
  }

  function applyPreview(colors) {
    if (!colors) return;
    if (previewTitle) previewTitle.style.color = colors.texto1 || '';
    if (previewSub) previewSub.style.color = colors.texto2 || '';
    const box = document.getElementById('preview-box');
    if (box) box.style.background = colors.cor_secundaria || '';
    const wrapper = document.getElementById('preview-cores');
    if (wrapper) wrapper.style.border = `2px solid ${colors.cor_principal || 'transparent'}`;
  }

  function sendColors() {
    const colors = buildColors();
    try { canal.postMessage({ acao: 'colors', colors }); } catch (e) {}
    try { localStorage.setItem('lt_colors', JSON.stringify(colors)); } catch (e) {}
  }

  // eventos
  [corPrincipal, texto1, corSecundaria, texto2].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => applyPreview(buildColors()));
  });

  if (btnAplicar) btnAplicar.addEventListener('click', sendColors);
  if (btnSalvarCores) btnSalvarCores.addEventListener('click', function() {
    sendColors();
    alert('Cores salvas.');
  });

  // ao carregar, tentar restaurar cores salvas
  try {
    const raw = localStorage.getItem('lt_colors');
    if (raw) {
      const saved = JSON.parse(raw);
      if (corPrincipal && saved.cor_principal) corPrincipal.value = saved.cor_principal;
      if (texto1 && saved.texto1) texto1.value = saved.texto1;
      if (corSecundaria && saved.cor_secundaria) corSecundaria.value = saved.cor_secundaria;
      if (texto2 && saved.texto2) texto2.value = saved.texto2;
      applyPreview(saved);
    }
  } catch (e) {}
}

function initBancoDeDados() {
  // Puxa os dados salvos ou cria uma lista vazia
  let bancoDados = JSON.parse(localStorage.getItem('gc_lista_pessoas')) || [];

  const listaDb = document.getElementById('lista-db');
  const buscaDb = document.getElementById('busca-db');
  const novoNomeDb = document.getElementById('novo-nome-db');
  const novoInfoDb = document.getElementById('novo-info-db');
  const btnSalvarDb = document.getElementById('btn-salvar-db');
  const inputNome = document.getElementById('nome');
  const inputInfo = document.getElementById('info');
  const dbContainer = document.getElementById('db-container-oculto');

  // Exibe as opções do banco de dados ao focar na busca
  if (buscaDb && dbContainer) {
    const hideDb = () => {
      setTimeout(() => {
        if (document.activeElement !== buscaDb && !dbContainer.contains(document.activeElement)) {
          dbContainer.style.display = 'none';
        }
      }, 200);
    };

    buscaDb.addEventListener('focus', () => {
      dbContainer.style.display = 'block';
    });
    buscaDb.addEventListener('blur', hideDb);
    dbContainer.addEventListener('focusout', hideDb);
  }

  // Função auxiliar para salvar e redesenhar
  function salvarEAtualizar() {
    localStorage.setItem('gc_lista_pessoas', JSON.stringify(bancoDados));
    renderizarListaDb(buscaDb.value);
  }

  // Função para renderizar a lista na tela com base na pesquisa
  function renderizarListaDb(filtro = '') {
    listaDb.innerHTML = '';
    
    // Filtra ignorando maiúsculas e minúsculas
    const termo = filtro.toLowerCase();
    const filtrados = bancoDados.filter(item => 
      (item.nome || '').toLowerCase().includes(termo) || 
      (item.info || '').toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
      listaDb.innerHTML = '<div style="padding: 10px; text-align: center; color: #888; font-size: 0.9em;">Nenhum resultado encontrado.</div>';
      return;
    }

    // Cria o HTML para cada item encontrado usando DOM API (mais seguro que innerHTML)
    filtrados.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'item-db';

      // Container de texto (clicável para carregar)
      const divText = document.createElement('div');
      divText.className = 'item-db-text';
      
      const divNome = document.createElement('div');
      divNome.className = 'item-db-nome';
      divNome.textContent = item.nome;

      const divInfo = document.createElement('div');
      divInfo.className = 'item-db-info';
      divInfo.textContent = item.info;

      divText.appendChild(divNome);
      divText.appendChild(divInfo);

      // Ação de carregar
      divText.addEventListener('click', () => {
        inputNome.value = item.nome;
        inputInfo.value = item.info;
        // Dispara evento 'input' para que o sistema de slots detecte a mudança e salve automaticamente se houver slot ativo
        inputNome.dispatchEvent(new Event('input'));
        inputInfo.dispatchEvent(new Event('input'));
      });

      // Botão de excluir
      const btnDel = document.createElement('button');
      btnDel.className = 'btn-excluir-db';
      btnDel.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';
      btnDel.title = 'Excluir';
      
      // Ação de excluir
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que o clique carregue os dados ao tentar excluir
        if (confirm(`Deseja remover "${item.nome}" da lista?`)) {
          const indexReal = bancoDados.indexOf(item);
          if (indexReal > -1) {
            bancoDados.splice(indexReal, 1);
            salvarEAtualizar();
          }
        }
      });

      div.appendChild(divText);
      div.appendChild(btnDel);
      listaDb.appendChild(div);
    });
  }

  // Adiciona nova pessoa ao clicar no botão "+"
  if (btnSalvarDb) {
    btnSalvarDb.addEventListener('click', () => {
      const n = novoNomeDb.value.trim();
      const i = novoInfoDb.value.trim();
      
      if (n || i) { // Só salva se tiver algo escrito
        bancoDados.push({ nome: n, info: i });
        novoNomeDb.value = '';
        novoInfoDb.value = '';
        salvarEAtualizar();
      }
    });
  }

  // Evento que atualiza a lista enquanto você digita na barra de busca
  if (buscaDb) {
    buscaDb.addEventListener('input', (e) => {
      renderizarListaDb(e.target.value);
    });
  }

  // Inicializa a lista ao abrir a página
  renderizarListaDb();
}

function initEasterEgg() {
  const buscaDb = document.getElementById('busca-db');
  if (!buscaDb) return;

  let glowTimer = null;

  buscaDb.addEventListener('input', function() {
    if (this.value.trim().toLowerCase() === 'glow') {
      const paineis = document.querySelectorAll('.painel');
      paineis.forEach(p => p.classList.add('glow-active'));
      if (glowTimer) clearTimeout(glowTimer);
      glowTimer = setTimeout(() => {
        paineis.forEach(p => p.classList.remove('glow-active'));
      }, 1000);
    }
  });
}