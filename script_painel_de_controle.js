 // Cria o canal de broadcast
  const canal = new BroadcastChannel('painel_exibicao');

  const sentidoSwitch = document.getElementById('painel-switchlowerthird');
  const nome = document.getElementById('nome');
  const info = document.getElementById('info');

  // Desliga automático após 8 segundos quando ativado
  let sentidoAutoOffTimer = null;
  sentidoSwitch.addEventListener('change', function() {
    // se ligado, mostra e programa desligamento
    if (sentidoSwitch.checked) {
      canal.postMessage({
        acao: 'mostrarLowerthird',
        nome: nome.value,
        info: info.value
      });

      // também aciona o vídeo de teste via ação 'test' somente se o tema 'teste' estiver ativo
      const temaAtivo = document.getElementById('tema-select');
      if (temaAtivo && temaAtivo.value === 'teste') {
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

  // Se quiser atualizar em tempo real ao digitar:
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

  const temaSelect = document.getElementById('tema-select');
  temaSelect.addEventListener('change', function() {
    canal.postMessage({ acao: 'alterarTema', tema: temaSelect.value });
  });

  // Switch de teste: envia ação 'test' com estado ligado (true/false)
  const testSwitch = document.getElementById('painel-switchteste');
  if (testSwitch) {
    testSwitch.addEventListener('change', function() {
      canal.postMessage({ acao: 'test', ligado: testSwitch.checked });
    });
  }

  // --- Gerenciamento simples de "variáveis" por botão (1..8) ---
  // Cada slot guarda { nome, info } em memória e também em localStorage (para persistir entre sessões).
  const slots = {};
  for (let i = 1; i <= 8; i++) {
    const raw = localStorage.getItem(`slot_${i}`);
    slots[i] = raw ? JSON.parse(raw) : { nome: '', info: '' };
  }

  let activeSlot = null;
  const botaoSlots = document.querySelectorAll('.botao-salvo');

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

// --- Seção: seleção de cores (apenas se a página de configuração existir) ---
try {
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

} catch (err) {
  // silencioso se elementos não existirem nessa página
}

// --- Carregar versão local do version.json ---
(function() {
  const displayEl = document.getElementById('versao-display');
  if (displayEl) {
    fetch('version.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.version) {
          displayEl.textContent = 'v' + data.version;
        }
      })
      .catch(e => {
        console.error('Erro ao carregar version.json:', e);
        displayEl.textContent = 'Erro ao carregar';
      });
  }
})();

// --- Verificação de versão via GitHub ---
(function() {
  const btnAtualizar = document.getElementById('botao-atualizar');
  const repoUrl = 'https://github.com/victorg4briel13/Pluggin-lower-third';

  function compareSemver(a, b) {
    const pa = normalize(a).split('.').map(n => parseInt(n || '0', 10));
    const pb = normalize(b).split('.').map(n => parseInt(n || '0', 10));
    for (let i = 0; i < 3; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }

  if (btnAtualizar) btnAtualizar.addEventListener('click', function() {
    window.open(repoUrl, '_blank');
  });

})();