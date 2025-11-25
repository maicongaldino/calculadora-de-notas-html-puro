# Calculadora de Notas (HTML Puro)

Calculadora simples para médias de avaliações (AV1/AV2) com regra de pesos, exibição da média final e indicação de situação (Aprovado/Recuperação/Reprovado). Projeto estático, sem backend, pronto para GitHub Pages e com suporte PWA (instalável e com cache offline básico).

## Funcionalidades
- Separação de estilos e scripts em `css/estilos.css` e `js/app.js`.
- Exibição de médias parciais (AV1/AV2) e média final com animação suave.
- Regras configuráveis de pesos e limites em `js/app.js` (`REGRAS`).
- Formatação numérica consistente em pt-BR com `Intl.NumberFormat`.
- Validação acessível de entradas: marca campo inválido com `aria-invalid="true"` e estilo sutil.
- Foco visível e acessível com `:focus-visible`.
- Botão "Copiar relatório" com feedback visual e fallback de cópia.
- Ícones Lucide (se presente) para estados e feedback.
- PWA: manifest, service worker, instalação como app e funcionamento offline básico.

## Estrutura de Pastas
```
├── README.md
├── assets\
│   └── favicon.svg
├── css\
│   └── estilos.css
├── index.html
├── js\
│   └── app.js
├── manifest.webmanifest
└── sw.js
```

## Como Rodar Localmente
1. Requisitos: Python 3 instalado.
2. No diretório do projeto, rode:
   - `python -m http.server 8000`
3. Abra `http://localhost:8000/` no navegador.

Observações importantes:
- Service Worker e PWA só funcionam em contextos seguros: `https` ou `http://localhost`. Não funciona via `file://`.
- Se o cache do SW estiver desatualizado, faça um hard refresh (`Ctrl+F5`) ou limpe o cache do site.

## Publicação no GitHub Pages
1. Faça push dos arquivos para a branch padrão (`main` ou `master`).
2. Acesse Settings → Pages → Source e selecione a branch (root).
3. Use caminhos relativos no `index.html` (já está configurado), por exemplo:
   - `./css/estilos.css`, `./js/app.js`, `./manifest.webmanifest`.
4. Se você usar pastas com underscore (`_algumaCoisa/`), crie um `.nojekyll` para evitar bloqueios.

## PWA (Progressive Web App)
- Manifesto: `manifest.webmanifest` com `name`, `short_name`, `theme_color`, `display: standalone` e ícone principal (`assets/favicon.svg`).
- Service Worker: `sw.js` com cache offline-first de arquivos essenciais.
- Instalação:
  - Android/Chrome: opção "Adicionar à tela inicial".
  - Desktop/Chrome: menu ⋮ → "Instalar Calculadora de Notas".
- Atualização do app:
  - O SW utiliza versão de cache (`CACHE_NAME`). Ao mudar arquivos, incremente a versão para forçar atualização.
- Ícones:
  - Atualmente usa `SVG` (`assets/favicon.svg`). Muitos navegadores aceitam, mas para compatibilidade máxima, você pode adicionar PNGs `192x192` e `512x512` e referenciá-los no manifest.

## Convenções e Acessibilidade
- Linguagem: nomes e textos em português; convenções de tecnologia (HTML/JS/CSS) mantidas.
- Acessibilidade:
  - `:focus-visible` para foco claro em inputs e botões.
  - `aria-invalid="true"` para campos com valores fora dos limites.
  - Mensagens e estados com contraste adequado.
- Validação de entrada:
  - Aceita vírgula e ponto; higieniza múltiplos pontos; restringe casas decimais; limita entre 0 e 10.

## Configurações Rápidas (`js/app.js`)
- `REGRAS.PESOS`: pesos da AV1/AV2 (trabalho/QStone).
- `REGRAS.LIMITES`: min/max e casas decimais.
- `REGRAS.SITUACAO`: textos, ícones e cores da situação (aprovado/recuperação/reprovado/padrão).
- `ANIMACAO.DURACAO_MS`: duração da animação das médias.

## Fluxo de Uso
1. Informe as notas de Trabalho e QStone para AV1 e AV2.
2. Veja as médias parciais e a média final (animadas e formatadas).
3. Verifique a situação indicada por texto e ícone.
4. Use o botão "Copiar relatório" para compartilhar.

## Checklist de Testes Manuais
- Entradas vazias: sem erro, situação padrão.
- Separador: aceita vírgula e ponto; múltiplos pontos são bloqueados.
- Limites: valores fora de 0–10 ficam com `aria-invalid` e estilo de erro.
- Estados:
  - Aprovado: média final ≥ 6.
  - Recuperação: média final ≥ 4 e < 6.
  - Reprovado: média final < 4.
- Copiar relatório: texto é copiado; feedback "Copiado!" aparece e volta ao normal.
- Ícones: os ícones Lucide aparecem nos estados (se a lib estiver carregada).
- PWA: consegue instalar e abrir offline; após atualizar arquivos, o app atualiza quando o SW troca a versão.

## Problemas Comuns
- O ícone de instalação não aparece:
  - Em alguns navegadores, prefira PNG `192x192` e `512x512` no manifest.
- Mudanças de CSS/JS não aparecem:
  - Hard refresh (`Ctrl+F5`) ou limpe o cache. Considere incrementar `CACHE_NAME` no `sw.js`.
- Service Worker não ativa:
  - Verifique se está rodando em `https` ou `http://localhost`.

## Contribuição
- Sugestões são bem-vindas. Mantenha o estilo simples (KISS/DRY), nomenclatura em português e foco em acessibilidade.