// Seletores principais
const btnStart = document.getElementById("btnStart");
const startScreen = document.getElementById("start");
const pagesLeft = document.getElementById("pagesLeft");
const pagesRight = document.getElementById("pagesRight");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");
const tapPrev = document.getElementById("tapPrev");
const tapNext = document.getElementById("tapNext");

const rawItems = [...document.querySelectorAll("#livro-textos > div")]; // 31
let items = [];            // [sumário, ...31 páginas]
let current = 0;           // índice da primeira página do spread (esquerda)
let totalPages = 0;

// util: cria um "card" de página com floreios e tema
function makePageHTML(innerHTML, themeClass){
  return `
    <article class="page-skin ${themeClass}">
      ${innerHTML}
    </article>
  `;
}

// gera página de sumário automaticamente com base nos títulos (h2) das demais páginas
function buildSumario(pages){
  const lis = pages.map((el, idx) => {
    const title = el.querySelector("h2")?.textContent?.trim() || `Página ${idx+1}`;
    const targetIndex = idx + 1; // +1 porque sumário será a página 0
    return `<li data-target="${targetIndex}">${title}</li>`;
  }).join("");
  const html = `
    <h2>Sumário</h2>
    <ul class="sumario">${lis}</ul>
    <p style="margin-top:.8rem;opacity:.75">Toque/click em um item para ir direto à página.</p>
  `;
  return html;
}

// Aplica temas alternados nas páginas (A/B/C para variações suaves)
function themeFor(i){
  const cycle = ["theme-a","theme-b","theme-c"];
  return cycle[i % cycle.length];
}

// Renderização do "spread" (duas páginas lado a lado)
function render(){
  // controla estados dos botões
  btnPrev.disabled = current <= 0;
  btnNext.disabled = current >= totalPages - 2;

  const leftHTML  = items[current] ? makePageHTML(items[current], themeFor(current)) : "";
  const rightHTML = items[current+1] ? makePageHTML(items[current+1], themeFor(current+1)) : "";

  pagesLeft.innerHTML = leftHTML;
  pagesRight.innerHTML = rightHTML;

  // listeners do sumário (se estiver na página 0 à esquerda ou à direita)
  attachSumarioHandlers();
}

// Conecta cliques do sumário para navegação
function attachSumarioHandlers(){
  document.querySelectorAll(".sumario li").forEach(li => {
    li.addEventListener("click", () => {
      const target = parseInt(li.getAttribute("data-target"), 10);
      // garante que o alvo apareça na esquerda (primeira do spread)
      current = Math.max(0, Math.min(totalPages-1, target));
      // se for ímpar e existir uma anterior, ajusta para par (para cair na esquerda)
      if (current % 2 !== 0) current = current - 1;
      render();
    }, { once:true }); // evita acumular listeners
  });
}

// Navegação
function goNext(){
  if (current < totalPages - 2){
    current += 2;
    render();
  }
}
function goPrev(){
  if (current > 0){
    current -= 2;
    render();
  }
}

// Iniciar app
function init(){
  // constrói sumário + páginas
  const sumarioHTML = buildSumario(rawItems);
  items = [sumarioHTML, ...rawItems.map(el => el.innerHTML.trim())];
  totalPages = items.length;

  // começa pelo sumário (0 à esquerda, 1 à direita)
  current = 0;
  render();
}

// Eventos
btnStart.addEventListener("click", () => {
  startScreen.style.display = "none";
  init();
});
btnNext.addEventListener("click", goNext);
btnPrev.addEventListener("click", goPrev);
tapNext.addEventListener("click", goNext);
tapPrev.addEventListener("click", goPrev);

// Teclado
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
}, { passive:true });

// Gestos touch simples (swipe)
let touchStartX = null;
window.addEventListener("touchstart", (e) => {
  if (e.touches && e.touches.length === 1) touchStartX = e.touches[0].clientX;
}, { passive:true });
window.addEventListener("touchend", (e) => {
  if (touchStartX == null) return;
  const endX = e.changedTouches[0].clientX;
  const dx = endX - touchStartX;
  if (Math.abs(dx) > 40){
    if (dx < 0) goNext();
    else goPrev();
  }
  touchStartX = null;
}, { passive:true });

// Acessibilidade: foco nos botões iniciais
window.addEventListener("load", () => {
  btnStart?.focus();
});
