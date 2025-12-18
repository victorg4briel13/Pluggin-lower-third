

// Cria o canal de broadcast

const canal = new BroadcastChannel('painel_exibicao');

function mostrarBarra() {
  const barra = document.getElementById('revelaBarra');
  barra.classList.add('mostrar');
}

function esconderBarra() {
  const barra = document.getElementById('revelaBarra');
  barra.classList.remove('mostrar');
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

  if (event.data.acao === 'alterarTema') {
    document.body.className = event.data.tema;
    // Troca a imagem do lower third conforme o tema
    if (event.data.tema === 'padrao') {
      lowerthirdImg.src = './Imagens/lowerthird0.png';
    } else if (event.data.tema === 'novosentido') {
      lowerthirdImg.src = './Imagens/lowerthird1.png';
    } else if (event.data.tema === 'semanadeoracao') {
      lowerthirdImg.src = './Imagens/lowerthird2.png';
    }
  }};