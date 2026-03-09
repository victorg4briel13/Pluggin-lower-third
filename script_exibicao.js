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

function testeAcionado(ligado) {
  const videoContainer = document.getElementById('video-testegc-container');
  if (!testeGcVideo || !videoContainer) return;

  if (ligado) {
    videoContainer.style.opacity = '1';
    try { 
      testeGcVideo.currentTime = 0; 
      testeGcVideo.play(); 
    } catch (e) { 
      console.warn('Erro ao reproduzir teste-gc:', e); 
    }
  } else {
    try { 
      testeGcVideo.pause(); 
      testeGcVideo.currentTime = 0; 
    } catch (e) {}
    videoContainer.style.opacity = '0';
  }
}

// Variaveis
const lowerthird = document.getElementById('lowerthird-container');
const lowerthirdImg = lowerthird.querySelector('img');
const lowerthirdNome = document.getElementById('lowerthird-nome');
const lowerthirdInfo = document.getElementById('lowerthird-info');

const actions = {
  mostrarBarra: () => {
    const barra = document.getElementById('revelaBarra');
    if(barra) barra.classList.add('mostrar');
  },
  esconderBarra: () => {
    const barra = document.getElementById('revelaBarra');
    if(barra) barra.classList.remove('mostrar');
  },
  mostrarLowerthird: (data) => {
    lowerthird.style.opacity = 1;
    lowerthirdNome.textContent = data.nome || '';
    lowerthirdInfo.textContent = data.info || '';
  },
  esconderLowerthird: () => {
    lowerthird.style.opacity = 0;
    lowerthirdNome.textContent = '';
    lowerthirdInfo.textContent = '';
  },
  test: (data) => {
    try {
      testeAcionado(Boolean(data.ligado));
    } catch (err) {
      console.error('Erro ao executar testeAcionado:', err);
    }
  },
  testSwitch: (data) => actions.test(data), // Alias
  alterarTema: (data) => {
    document.body.className = data.tema;
    const videoContainer = document.getElementById('video-testegc-container');
    
    // Se o tema for 'teste', prepara o vídeo mas NÃO inicia — o switch controla a reprodução
    if (data.tema === 'teste') {
      if (lowerthirdImg) lowerthirdImg.style.display = 'none';
      testeAcionado(false); // Garante que comece desligado
    } else {
      // caso contrário, garante que o vídeo pare/está escondido e restaura a imagem
      testeAcionado(false);
      if (lowerthirdImg) lowerthirdImg.style.display = 'block';
      
      // Troca a imagem do lower third conforme o tema
      const imagens = {
        'padrao': './Imagens/gcPadrao.png',
        'novosentido': './Imagens/gcNovoSentido.png',
        'semanadeoracao': './Imagens/gcSemanaDeOracao.png'
      };
      if (imagens[data.tema]) lowerthirdImg.src = imagens[data.tema];
    }
  }
};

canal.onmessage = function(event) {
  const { acao } = event.data;
  if (actions[acao]) {
    actions[acao](event.data);
  }
};