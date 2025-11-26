const REGRAS = Object.freeze({
  PESOS: { TRABALHO: 0.6, QSTONE: 0.4 },
  LIMITES: { MIN: 0, MAX: 10, CASAS_DECIMAIS: 2 },
  SITUACAO: {
    APROVADO: {
      notaCorte: 6,
      texto: "Aprovado! Parabéns",
      classeCor: "text-emerald-400",
      icone: "check-circle-2",
    },
    RECUPERACAO: {
      notaCorte: 4,
      texto: "Reavaliação Necessária",
      classeCor: "text-yellow-400",
      icone: "alert-circle",
    },
    REPROVADO: {
      texto: "Reprovado",
      classeCor: "text-red-400",
      icone: "x-circle",
    },
    PADRAO: {
      texto: "Aguardando dados...",
      classeCor: "text-gray-300",
      icone: "circle-dashed",
    },
  },
  ANIMACAO: { DURACAO_MS: 600 },
});

const DOM = {
  formulario: document.getElementById("formulario-notas"),
  entradas: document.querySelectorAll(".campo-nota"),
  saidas: {
    av1: document.getElementById("resultado-av1"),
    av2: document.getElementById("resultado-av2"),
    final: document.getElementById("resultado-final"),
  },
  situacao: {
    texto: document.getElementById("texto-situacao"),
    containerIcone: document.getElementById("icone-situacao"),
  },
  botoes: {
    copiar: document.getElementById("botao-copiar"),
    limpar: document.getElementById("botao-limpar"),
  },
};

function calcularMediaPonderada(notaTrabalho, notaQstone) {
  return notaTrabalho * REGRAS.PESOS.TRABALHO + notaQstone * REGRAS.PESOS.QSTONE;
}

function calcularMediaFinal(notaAv1, notaAv2) {
  return (notaAv1 + notaAv2) / 2;
}

function determinarSituacao(notaFinal, possuiDados) {
  if (!possuiDados) return REGRAS.SITUACAO.PADRAO;
  if (notaFinal >= REGRAS.SITUACAO.APROVADO.notaCorte) return REGRAS.SITUACAO.APROVADO;
  if (notaFinal >= REGRAS.SITUACAO.RECUPERACAO.notaCorte) return REGRAS.SITUACAO.RECUPERACAO;
  return REGRAS.SITUACAO.REPROVADO;
}

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

const FORMATADOR = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatarNumero(numero) {
  return FORMATADOR.format(Number(truncar(numero)));
}

function truncar(numero) {
  const fator = Math.pow(10, REGRAS.LIMITES.CASAS_DECIMAIS);
  return Math.trunc(Number(numero) * fator) / fator;
}

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

  const mediaAv1Bruto = calcularMediaPonderada(notas.av1.trabalho, notas.av1.qstone);
  const mediaAv2Bruto = calcularMediaPonderada(notas.av2.trabalho, notas.av2.qstone);
  const mediaFinalBruta = calcularMediaFinal(mediaAv1Bruto, mediaAv2Bruto);

  const mediaAv1 = mediaAv1Bruto;
  const mediaAv2 = mediaAv2Bruto;
  const mediaFinal = mediaFinalBruta;
  const situacao = determinarSituacao(mediaFinalBruta, possuiDados);

  animarValorNumerico(DOM.saidas.av1, parseFloat(DOM.saidas.av1.textContent) || 0, mediaAv1);
  animarValorNumerico(DOM.saidas.av2, parseFloat(DOM.saidas.av2.textContent) || 0, mediaAv2);
  animarValorNumerico(DOM.saidas.final, parseFloat(DOM.saidas.final.textContent) || 0, mediaFinal);

  atualizarVisualSituacao(situacao);
  alternarEstadoBotaoCopiar(possuiDados);
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
      } else {
        evento.target.removeAttribute('aria-invalid');
        evento.target.classList.remove('campo-invalido');
      }
      debouncedAtualizar();
    }
  });

  DOM.botoes.limpar.addEventListener("click", () => {
    DOM.entradas.forEach((input) => (input.value = ""));
    atualizarInterface();
    DOM.entradas[0]?.focus();
  });

  DOM.botoes.copiar.addEventListener("click", copiarRelatorio);

  atualizarInterface();
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarAplicacao();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { });
  }
});
