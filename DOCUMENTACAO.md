# Documentação do projeto: Pluggin-lower-third

Resumo breve
-----------
Este repositório contém um painel de controle e uma página de exibição (lower third) para uso com OBS ou navegador. A comunicação entre painel e exibição é feita via `BroadcastChannel` nomeado `painel_exibicao`.

Como usar
---------
- Abra `painel de controle.html` para controlar temas, textos e acionar a transmissão.
- Abra `configuração.html` para ajustar cores e pré-visualizar.
- Carregue `exibição.html` (ou use como Browser Source no OBS) para exibir o lower third, QR e animações.

Arquivos principais
------------------
- **configuração.html**: página para selecionar cores (inputs `type="color"`) e algumas pré-visualizações simples.
  - IDs importantes: `cor_principal`, `texto1`, `cor_secundaria`, `texto2`.
- **painel de controle.html**: painel com seleção de tema, switches, campos de texto e botões de slots (1..8).
  - Elementos importantes: `tema-select` (select de temas), botões `.botao-salvo[data-slot="N"]`, `painel-switchlowerthird` (switch de transmissão).
- **exibição.html**: página que mostra o lower third, QR, barra inferior e o vídeo de teste.
  - IDs e classes visíveis: `revelaBarra` (barra inferior), `qr-container`, `qr-img`, `qr-desc`, `lowerthird-container`, `lowerthird-nome`, `lowerthird-info`, `video-testegc-container`, `teste-gc-video`.
- **style.css**: estilos para os painéis e elementos de controle; inclui estilos para inputs de cor (formato pílula) e layout das color-rows.
- **script_painel_de_controle.js**: lógica do painel;
  - Usa `BroadcastChannel('painel_exibicao')` para enviar mensagens com ações como: `mostrarLowerthird`, `esconderLowerthird`, `alterarTema`, `colors`, `test`.
  - Gerencia slots 1..8, salvando em `localStorage` com chaves `slot_1`, `slot_2`, ... e `active_slot`.
  - Salva cores em `localStorage` na chave `lt_colors`.
- **script_exibicao.js**: escuta o `BroadcastChannel` e aplica as ações recebidas na UI de exibição (mostrar/esconder elementos, trocar tema, iniciar/pausar vídeo de teste, atualizar QR).

Pastas e recursos
------------------
- **animacoes/**: contém o arquivo `teste gc.webm` usado pelo vídeo de teste.
- **fontes/**: fontes customizadas (ex.: `TemporaLGCUni-BoldItalic.ttf`, `TemporaLGCUni-Regular.ttf`).
- **Imagens/**: contém `lowerthird*.png`, `qrcodestyle.png`, etc.

Temas
-----
O sistema usa classes no `body` para controlar estilos por tema:
- `body.padrao`, `body.novosentido`, `body.semanadeoracao`, `body.teste` — cada um altera posicionamento e fontes do lower third.

Mensagens / ações do BroadcastChannel
-------------------------------------
Exemplos de mensagens enviadas pelo painel:
- `{ acao: 'mostrarLowerthird', nome, info }`
- `{ acao: 'esconderLowerthird' }`
- `{ acao: 'alterarTema', tema }`  // tema: 'padrao'|'novosentido'|'semanadeoracao'|'teste'
- `{ acao: 'colors', colors }`  // objeto com as chaves: cor_principal, texto1, cor_secundaria, texto2
- `{ acao: 'test', ligado: true|false }`

LocalStorage usado
------------------
- `slot_N` (ex.: `slot_1`) — armazena JSON com `{ nome, info }` para cada botão.
- `active_slot` — slot atualmente ativo.
- `lt_colors` — JSON com as cores selecionadas em `configuração.html`.

Personalização rápida
---------------------
- Para editar cores padrão, modifique os valores `value="#xxxxxx"` nos inputs em `configuração.html` ou altere `lt_colors` no `localStorage`.
- Para adicionar/alterar imagens ou fontes, coloque os arquivos em `Imagens/` ou `fontes/` e atualize os caminhos em `exibição.html` ou CSS.
- Para ajustar posições do lower third, edite `exibição.html` estilos inline (ou mova regras para `style.css`).

Notas do desenvolvedor
----------------------
- Inputs de cor estão estilizados como pílula em `style.css` (propriedades `border-radius` e `::-webkit-color-swatch`, `::-moz-color-swatch`).
- O projeto assume suporte moderno do navegador para `BroadcastChannel`, `querySelector`, `localStorage` e APIs de mídia.

Próximos passos sugeridos
------------------------
- Adicionar pré-visualização em `configuração.html` que mostre as cores em um cartão exemplo (já existe alguma lógica JS que aplica preview se os elementos estiverem presentes).
- Documentar passos para integrar `exibição.html` como Browser Source no OBS (ex.: URL local ou arquivo servido).

---
Gerado automaticamente: arquivo de referência do projeto.
