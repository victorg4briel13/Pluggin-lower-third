 // Cria o canal de broadcast
  const canal = new BroadcastChannel('painel_exibicao');

  /*
  // Switch Instagram (comentado)
  const instaSwitch = document.getElementById('switch-insta');
  instaSwitch.addEventListener('change', function() {
    if (instaSwitch.checked) {
      canal.postMessage({ acao: 'mostrarBarra' });
      setTimeout(() => {
         instaSwitch.checked = false;
         canal.postMessage({ acao: 'esconderBarra' });
       }, 15000);
    } else {
      canal.postMessage({ acao: 'esconderBarra' });
    }
  });
  */
  /*
  // QR Code - Enviar imagem e descrição (comentado)
  const qrInput = document.getElementById('qrcode-img');

  qrInput.addEventListener('change', function() {
    const file = qrInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        canal.postMessage({
          acao: 'atualizarQR',
          imagem: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Switch do QR (comentado)
  const qrSwitch = document.getElementById('painel-switch4');
  qrSwitch.addEventListener('change', function() {
    if (qrSwitch.checked) {
      canal.postMessage({ acao: 'mostrarQR' });
    } else {
      canal.postMessage({ acao: 'esconderQR' });
    }
  });
  */

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

      // limpa timer anterior (evita múltiplos)
      if (sentidoAutoOffTimer) {
        clearTimeout(sentidoAutoOffTimer);
      }
      sentidoAutoOffTimer = setTimeout(() => {
        sentidoSwitch.checked = false;
        canal.postMessage({ acao: 'esconderLowerthird' });
        sentidoAutoOffTimer = null;
      }, 8000); // 8000 ms = 8 segundos

    } else {
      // se desligou manualmente, cancela timer e esconde
      if (sentidoAutoOffTimer) {
        clearTimeout(sentidoAutoOffTimer);
        sentidoAutoOffTimer = null;
      }
      canal.postMessage({ acao: 'esconderLowerthird' });
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