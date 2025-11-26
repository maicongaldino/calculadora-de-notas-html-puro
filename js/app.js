const REGRAS = window.REGRAS;

const DOM = {
  formulario: document.getElementById("formulario-notas"),
  entradas: document.querySelectorAll(".campo-nota"),
  saidas: {
    av1: document.getElementById("resultado-av1"),
    av2: document.getElementById("resultado-av2"),
    final: document.getElementById("resultado-final"),
    meta: document.getElementById("meta-av2"),
    metaMsg: document.getElementById("meta-av2-msg"),
  },
  situacao: {
    texto: document.getElementById("texto-situacao"),
    containerIcone: document.getElementById("icone-situacao"),
  },
  botoes: {
    copiar: document.getElementById("botao-copiar"),
    limpar: document.getElementById("botao-limpar"),
    compartilhar: document.getElementById("botao-compartilhar"),
    meta: document.getElementById("botao-meta"),
  },
};

const Core = window.Core;

function higienizarEntrada(valor) {
  if (!valor) return "";
  valor = String(valor).replace(",", ".");
  let valorLimpo = valor.replace(/[^0-9.]/g, "");
  const partes = valorLimpo.split(".");
  if (partes.length > 2) {
    valorLimpo = partes[0] + "." + partes.slice(1).join("");
  }

  const numero = parseFloat(valorLimpo);
  if (isNaN(numero)) return "";

  if (numero > REGRAS.LIMITES.MAX) return REGRAS.LIMITES.MAX.toString();

  if (valorLimpo.includes(".")) {
    const [inteiro, decimal = ""] = valorLimpo.split(".");
    if (decimal.length > REGRAS.LIMITES.CASAS_DECIMAIS) {
      return `${inteiro}.${decimal.substring(0, REGRAS.LIMITES.CASAS_DECIMAIS)}`;
    }
  }

  return valorLimpo;
}

function formatarNumero(n) { return Core.formatarNumero(n); }

function animarValorNumerico(elemento, valorInicial, valorFinal) {
  valorInicial = Number(valorInicial) || 0;
  valorFinal = Number(valorFinal) || 0;
  if (valorInicial === valorFinal) {
    elemento.textContent = formatarNumero(valorFinal);
    return;
  }

  const delta = valorFinal - valorInicial;
  let inicioTimestamp = null;

  function passoAnimacao(timestamp) {
    if (!inicioTimestamp) inicioTimestamp = timestamp;
    const progresso = Math.min((timestamp - inicioTimestamp) / REGRAS.ANIMACAO.DURACAO_MS, 1);
    const suavizacao = progresso === 1 ? 1 : 1 - Math.pow(2, -10 * progresso);
    const valorAtual = valorInicial + delta * suavizacao;
    elemento.textContent = formatarNumero(valorAtual);
    if (progresso < 1) requestAnimationFrame(passoAnimacao);
  }

  requestAnimationFrame(passoAnimacao);
}

function atualizarVisualSituacao(configuracao) {
  const { texto, classeCor, icone } = configuracao;
  DOM.situacao.texto.textContent = texto;
  DOM.situacao.texto.className = `text-sm font-semibold transition-colors duration-300 ${classeCor}`;

  const iconeAtual = DOM.situacao.containerIcone.querySelector("svg")?.getAttribute("data-lucide");
  if (iconeAtual !== icone) {
    DOM.situacao.containerIcone.innerHTML = `<i data-lucide="${icone}" class="w-5 h-5 ${classeCor}"></i>`;
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
}

function alternarEstadoBotaoCopiar(ativo) {
  const botao = DOM.botoes.copiar;
  const classesDesabilitadas = ["opacity-50", "cursor-not-allowed"];
  botao.disabled = !ativo;
  if (ativo) {
    botao.classList.remove(...classesDesabilitadas);
  } else {
    botao.classList.add(...classesDesabilitadas);
  }
}

function atualizarInterface() {
  const obterValor = (id) => parseFloat(document.getElementById(id).value.replace(",", ".").trim()) || 0;

  const notas = {
    av1: {
      trabalho: obterValor("av1-trabalho"),
      qstone: obterValor("av1-qstone"),
    },
    av2: {
      trabalho: obterValor("av2-trabalho"),
      qstone: obterValor("av2-qstone"),
    },
  };

  const possuiDados = Array.from(DOM.entradas).some((input) => input.value.trim() !== "");

  const mediaAv1Bruto = Core.calcularMediaPonderada(notas.av1.trabalho, notas.av1.qstone);
  const mediaAv2Bruto = Core.calcularMediaPonderada(notas.av2.trabalho, notas.av2.qstone);
  const mediaFinalBruta = Core.calcularMediaFinal(mediaAv1Bruto, mediaAv2Bruto);

  const mediaAv1 = mediaAv1Bruto;
  const mediaAv2 = mediaAv2Bruto;
  const mediaFinal = mediaFinalBruta;
  const situacao = Core.determinarSituacao(mediaFinalBruta, possuiDados);

  animarValorNumerico(DOM.saidas.av1, parseFloat(DOM.saidas.av1.textContent) || 0, mediaAv1);
  animarValorNumerico(DOM.saidas.av2, parseFloat(DOM.saidas.av2.textContent) || 0, mediaAv2);
  animarValorNumerico(DOM.saidas.final, parseFloat(DOM.saidas.final.textContent) || 0, mediaFinal);
  atualizarMetaAprovacao(mediaAv1Bruto);

  atualizarVisualSituacao(situacao);
  alternarEstadoBotaoCopiar(possuiDados);
}

function atualizarMetaAprovacao(mediaAv1) {
  const corte = REGRAS.SITUACAO.APROVADO.notaCorte;
  const necessarioAv2 = Math.max(0, 2 * corte - mediaAv1);
  const ok = necessarioAv2 <= REGRAS.LIMITES.MAX;
  if (DOM.saidas.meta) DOM.saidas.meta.textContent = formatarNumero(necessarioAv2);
  if (DOM.saidas.metaMsg) DOM.saidas.metaMsg.textContent = ok ? "" : "Impossível alcançar com limite de 10,0";
}

async function copiarRelatorio() {
  const obterValorTxt = (id) => document.getElementById(id).value || "0.00";
  const obterTexto = (id) => document.getElementById(id).textContent;

  const textoRelatorio =
    `📊 Relatório de Desempenho\n\n` +
    `AV1\nTrabalho: ${obterValorTxt("av1-trabalho")}\nQStone: ${obterValorTxt("av1-qstone")}\nMédia: ${obterTexto("resultado-av1")}\n\n` +
    `AV2\nTrabalho: ${obterValorTxt("av2-trabalho")}\nQStone: ${obterValorTxt("av2-qstone")}\nMédia: ${obterTexto("resultado-av2")}\n\n` +
    `-------------------\n` +
    `Média Final: ${obterTexto("resultado-final")}\n` +
    `${DOM.situacao.texto.textContent}`;

  try {
    await navigator.clipboard.writeText(textoRelatorio);
    exibirFeedbackCopia(true);
  } catch {
    const areaTexto = document.createElement("textarea");
    areaTexto.value = textoRelatorio;
    document.body.appendChild(areaTexto);
    areaTexto.select();
    document.execCommand("copy");
    document.body.removeChild(areaTexto);
    exibirFeedbackCopia(true);
  }
}

function exibirFeedbackCopia(sucesso) {
  const botao = DOM.botoes.copiar;
  const htmlOriginal = botao.innerHTML;

  if (sucesso) {
    botao.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i><span>Copiado!</span>`;
    botao.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
    botao.classList.add("bg-emerald-500", "scale-105");
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  setTimeout(() => {
    botao.innerHTML = htmlOriginal;
    botao.classList.remove("bg-emerald-500", "scale-105");
    botao.classList.add("bg-indigo-600", "hover:bg-indigo-700");
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }, 1600);
}

function criarDebounce(funcao, atrasoMs = 150) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => funcao.apply(this, args), atrasoMs);
  };
}

function inicializarAplicacao() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
  const debouncedAtualizar = criarDebounce(atualizarInterface, 150);
  const debouncedAtualizarRota = criarDebounce(atualizarQuerystring, 150);
  DOM.formulario.addEventListener("input", (evento) => {
    if (evento.target.classList.contains("campo-nota")) {
      const valorHigienizado = higienizarEntrada(evento.target.value);
      if (evento.target.value !== valorHigienizado) {
        evento.target.value = valorHigienizado;
      }
      const numero = parseFloat(valorHigienizado.replace(',', '.'));
      const invalido = Number.isNaN(numero) || numero < REGRAS.LIMITES.MIN || numero > REGRAS.LIMITES.MAX;
      if (invalido) {
        evento.target.setAttribute('aria-invalid', 'true');
        evento.target.classList.add('campo-invalido');
        const mapaErros = {
          'av1-trabalho': 'erro-av1-trabalho',
          'av1-qstone': 'erro-av1-qstone',
          'av2-trabalho': 'erro-av2-trabalho',
          'av2-qstone': 'erro-av2-qstone',
        };
        const idErro = mapaErros[evento.target.id];
        if (idErro) {
          const el = document.getElementById(idErro);
          if (el) el.classList.remove('hidden');
        }
      } else {
        evento.target.removeAttribute('aria-invalid');
        evento.target.classList.remove('campo-invalido');
        const mapaErros = {
          'av1-trabalho': 'erro-av1-trabalho',
          'av1-qstone': 'erro-av1-qstone',
          'av2-trabalho': 'erro-av2-trabalho',
          'av2-qstone': 'erro-av2-qstone',
        };
        const idErro = mapaErros[evento.target.id];
        if (idErro) {
          const el = document.getElementById(idErro);
          if (el) el.classList.add('hidden');
        }
      }
      debouncedAtualizar();
      debouncedAtualizarRota();
    }
  });

  DOM.botoes.limpar.addEventListener("click", () => {
    DOM.entradas.forEach((input) => (input.value = ""));
    atualizarInterface();
    DOM.entradas[0]?.focus();
  });

  DOM.botoes.copiar.addEventListener("click", copiarRelatorio);
  if (DOM.botoes.compartilhar) DOM.botoes.compartilhar.addEventListener("click", compartilharLink);
  if (DOM.botoes.meta) DOM.botoes.meta.addEventListener("click", () => {
    const sec = document.getElementById("secao-meta");
    const visivel = !sec.classList.contains("hidden");
    sec.classList.toggle("hidden", visivel);
    DOM.botoes.meta.setAttribute("aria-expanded", String(!visivel));
    DOM.botoes.meta.querySelector("span").textContent = visivel ? "Mostrar Meta de Aprovação" : "Ocultar Meta de Aprovação";
  });

  DOM.formulario.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("campo-nota")) {
      e.preventDefault();
      const campos = Array.from(DOM.entradas);
      const idx = campos.indexOf(e.target);
      const prox = campos[idx + 1] || campos[0];
      prox.focus();
    }
  });

  atualizarInterface();
  carregarDeQuerystring();
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarAplicacao();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      const b = document.getElementById("badge-offline");
      if (b) b.classList.remove("hidden");
    }).catch(() => { });
  }
});

function obterValoresAtuais() {
  return {
    av1t: document.getElementById("av1-trabalho").value,
    av1q: document.getElementById("av1-qstone").value,
    av2t: document.getElementById("av2-trabalho").value,
    av2q: document.getElementById("av2-qstone").value,
  };
}

function compartilharLink() {
  const v = obterValoresAtuais();
  const params = new URLSearchParams({
    'av1-trabalho': v.av1t,
    'av1-qstone': v.av1q,
    'av2-trabalho': v.av2t,
    'av2-qstone': v.av2q,
  });
  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url).then(() => exibirFeedbackCopia(true));
}

function carregarDeQuerystring() {
  const p = new URLSearchParams(location.search);
  [
    ["av1-trabalho","av1-trabalho","av1t"],
    ["av1-qstone","av1-qstone","av1q"],
    ["av2-trabalho","av2-trabalho","av2t"],
    ["av2-qstone","av2-qstone","av2q"],
  ]
    .forEach(([id,keyFull,keyShort])=>{ 
      const val = p.get(keyFull) ?? p.get(keyShort);
      if (val!==null) document.getElementById(id).value = String(val).replace(".", ",");
    });
  atualizarInterface();
}

function atualizarQuerystring() {
  const v = obterValoresAtuais();
  const params = new URLSearchParams(location.search);
  const setOrDelete = (key, val) => {
    const s = String(val).trim();
    if (s) params.set(key, s.replace(',', '.'));
    else params.delete(key);
  };
  setOrDelete('av1-trabalho', v.av1t);
  setOrDelete('av1-qstone', v.av1q);
  setOrDelete('av2-trabalho', v.av2t);
  setOrDelete('av2-qstone', v.av2q);
  const newUrl = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, '', newUrl);
}

