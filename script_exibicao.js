// Cria o canal de broadcast
const canal = new BroadcastChannel('painel_exibicao');

// Inicialização do vídeo de teste
let testeGcVideo = null;

function initTesteGcVideo() {
  testeGcVideo = document.getElementById('teste-gc-video');
  if (testeGcVideo) {
    testeGcVideo.pause();
    testeGcVideo.currentTime = 0;
  }
}

// Inicializa quando o DOM estiver pronto
initTesteGcVideo();

function mostrarBarra() {
  const barra = document.getElementById('revelaBarra');
  barra.classList.add('mostrar');
}

function esconderBarra() {
  const barra = document.getElementById('revelaBarra');
  barra.classList.remove('mostrar');
}


function testeAcionado(ligado) {
  const videoContainer = document.getElementById('video-testegc-container');
  if (ligado) {
    if (testeGcVideo && videoContainer) {
      videoContainer.style.opacity = '1';
      try { testeGcVideo.currentTime = 0; testeGcVideo.play(); } catch (e) { console.warn('Erro ao reproduzir teste-gc:', e); }
    }
  } else {
    if (testeGcVideo && videoContainer) {
      try { testeGcVideo.pause(); testeGcVideo.currentTime = 0; } catch (e) {}
      videoContainer.style.opacity = '0';
    }
  }
}

// QR code dinâmico
const qrContainer = document.getElementById('qr-container');
const qrImg = document.getElementById('qr-img');
const qrDesc = document.getElementById('qr-desc');
const lowerthird = document.getElementById('lowerthird-container');
const lowerthirdImg = lowerthird.querySelector('img');
const lowerthirdNome = document.getElementById('lowerthird-nome');
const lowerthirdInfo = document.getElementById('lowerthird-info');

canal.onmessage = function(event) {
  if (event.data.acao === 'mostrarBarra') {
    mostrarBarra();
  }
  if (event.data.acao === 'esconderBarra') {
    esconderBarra();
  }
  
  if (event.data.acao === 'atualizarQR') {
    if (event.data.imagem) {
      qrImg.src = event.data.imagem;
      qrImg.style.display = 'block';
    }
    if (event.data.descricao !== undefined) {
      qrDesc.textContent = event.data.descricao;
    }
  }

  if (event.data.acao === 'mostrarQR') {
    qrContainer.classList.add('mostrar');
  }
  if (event.data.acao === 'esconderQR') {
    qrContainer.classList.remove('mostrar');
  }

  if (event.data.acao === 'mostrarLowerthird') {
    lowerthird.style.opacity = 1;
    lowerthirdNome.textContent = event.data.nome || '';
    lowerthirdInfo.textContent = event.data.info || '';
  }
  if (event.data.acao === 'esconderLowerthird') {
    lowerthird.style.opacity = 0;
    lowerthirdNome.textContent = '';
    lowerthirdInfo.textContent = '';
  }

  // Ação de teste: passa o estado 'ligado' para a função de manipulação
  if (event.data.acao === 'test' || event.data.acao === 'testSwitch') {
    try {
      testeAcionado(Boolean(event.data.ligado));
    } catch (err) {
      console.error('Erro ao executar testeAcionado:', err);
    }
  }

  if (event.data.acao === 'alterarTema') {
    document.body.className = event.data.tema;
    // Se o tema for 'teste', prepara o vídeo mas NÃO inicia — o switch controla a reprodução
    const videoContainer = document.getElementById('video-testegc-container');
    if (event.data.tema === 'teste') {
      if (lowerthirdImg) lowerthirdImg.style.display = 'none';
      if (videoContainer) {
        try { testeGcVideo.pause(); testeGcVideo.currentTime = 0; } catch (e) {}
        videoContainer.style.opacity = '0';
      }
    } else {
      // caso contrário, garante que o vídeo pare/está escondido e restaura a imagem
      if (videoContainer) {
        try { testeGcVideo.pause(); testeGcVideo.currentTime = 0; } catch (e) {}
        videoContainer.style.opacity = '0';
      }
      if (lowerthirdImg) lowerthirdImg.style.display = 'block';
      // Troca a imagem do lower third conforme o tema
      if (event.data.tema === 'padrao') {
        lowerthirdImg.src = './Imagens/lowerthird0.png';
      } else if (event.data.tema === 'novosentido') {
        lowerthirdImg.src = './Imagens/lowerthird1.png';
      } else if (event.data.tema === 'semanadeoracao') {
        lowerthirdImg.src = './Imagens/lowerthird2.png';
      }
    }
  }
};