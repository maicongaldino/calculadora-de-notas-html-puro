window.REGRAS = Object.freeze({
  PESOS: { TRABALHO: 0.6, QSTONE: 0.4 },
  LIMITES: { MIN: 0, MAX: 10, CASAS_DECIMAIS: 2 },
  SITUACAO: {
    APROVADO: { notaCorte: 6, texto: "Aprovado! Parabéns", classeCor: "text-emerald-400", icone: "check-circle-2" },
    RECUPERACAO: { notaCorte: 4, texto: "Reavaliação Necessária", classeCor: "text-yellow-400", icone: "alert-circle" },
    REPROVADO: { texto: "Reprovado", classeCor: "text-red-400", icone: "x-circle" },
    PADRAO: { texto: "Aguardando dados...", classeCor: "text-gray-300", icone: "circle-dashed" },
  },
  ANIMACAO: { DURACAO_MS: 600 },
});

const FORMATADOR = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

window.Core = {
  calcularMediaPonderada(notaTrabalho, notaQstone) {
    return notaTrabalho * REGRAS.PESOS.TRABALHO + notaQstone * REGRAS.PESOS.QSTONE;
  },
  calcularMediaFinal(notaAv1, notaAv2) {
    return (notaAv1 + notaAv2) / 2;
  },
  truncar(numero) {
    const fator = Math.pow(10, REGRAS.LIMITES.CASAS_DECIMAIS);
    return Math.trunc(Number(numero) * fator) / fator;
  },
  formatarNumero(numero) {
    return FORMATADOR.format(Number(this.truncar(numero)));
  },
  determinarSituacao(notaFinal, possuiDados) {
    if (!possuiDados) return REGRAS.SITUACAO.PADRAO;
    const faixas = [
      { min: REGRAS.SITUACAO.APROVADO.notaCorte, cfg: REGRAS.SITUACAO.APROVADO },
      { min: REGRAS.SITUACAO.RECUPERACAO.notaCorte, cfg: REGRAS.SITUACAO.RECUPERACAO },
      { min: -Infinity, cfg: REGRAS.SITUACAO.REPROVADO },
    ];
    for (const f of faixas) {
      if (notaFinal >= f.min) return f.cfg;
    }
    return REGRAS.SITUACAO.REPROVADO;
  },
};
