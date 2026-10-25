/* =========================================================
   Relatório de desempenho dos simulados e provas
   Cada questão pode ter q.tema e q.sub (subtema).
   Uso: Relatorio.html(questoes, respostas, { goto: 'nomeDaFuncao' })
   ========================================================= */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function nivel(pct) {
    if (pct >= 80) return 'bom';
    if (pct >= 60) return 'medio';
    return 'fraco';
  }
  function agrupar(qs, answers, key) {
    const map = new Map();
    qs.forEach((q, i) => {
      const a = answers[q.n];
      if (!a) return;
      const k = key(q);
      if (!map.has(k)) map.set(k, { nome: k, ok: 0, total: 0, erradas: [], subs: new Map() });
      const g = map.get(k);
      const certo = a === q.correta;
      g.total++; if (certo) g.ok++; else g.erradas.push({ q, i });
      const s = q.sub || 'Geral';
      if (!g.subs.has(s)) g.subs.set(s, { nome: s, ok: 0, total: 0 });
      const sg = g.subs.get(s); sg.total++; if (certo) sg.ok++;
    });
    return [...map.values()].map(g => Object.assign(g, { pct: Math.round(g.ok / g.total * 100) }));
  }

  function html(qs, answers, opts) {
    opts = opts || {};
    const goto = opts.goto || 'relGoTo';
    const temaUnico = opts.temaUnico; // provas: o tema é a própria matéria
    const temas = agrupar(qs, answers, q => temaUnico || q.tema || 'Geral');
    if (!temas.length) return '';
    const erradas = [];
    temas.forEach(t => erradas.push(...t.erradas));
    erradas.sort((a, b) => a.i - b.i);

    // subtemas errados, do pior para o melhor
    const subsErr = [];
    temas.forEach(t => t.subs.forEach(s => { if (s.ok < s.total) subsErr.push({ tema: t.nome, sub: s.nome, err: s.total - s.ok, total: s.total }); }));
    subsErr.sort((a, b) => (b.err / b.total) - (a.err / a.total) || b.err - a.err);

    // onde melhorar: temas abaixo de 70% (ou, se só há um tema, os subtemas)
    const fracos = temas.filter(t => t.pct < 70 && t.erradas.length).sort((a, b) => a.pct - b.pct);

    let h = '<section class="rel">';
    h += '<div class="rel-head"><div class="rel-kicker">Relatório de desempenho</div>';
    h += '<h3>' + (erradas.length ? 'Onde você precisa melhorar' : 'Nenhum erro — parabéns!') + '</h3></div>';

    if (erradas.length) {
      h += '<div class="rel-focus">';
      if (!temaUnico && fracos.length) {
        fracos.slice(0, 4).forEach(t => {
          const subs = [...t.subs.values()].filter(s => s.ok < s.total).map(s => s.nome);
          h += '<div class="rel-focus-item"><div class="rel-focus-title"><span class="rel-dot fraco"></span>' + esc(t.nome) +
               '<span class="rel-focus-pct">' + t.pct + '%</span></div>' +
               '<div class="rel-chips">' + subs.map(s => '<span class="rel-chip">' + esc(s) + '</span>').join('') + '</div></div>';
        });
      } else {
        h += '<div class="rel-focus-item"><div class="rel-focus-title">Revise estes subtemas</div><div class="rel-chips">' +
             subsErr.slice(0, 8).map(s => '<span class="rel-chip">' + esc(s.sub) + ' <b>' + s.err + '/' + s.total + '</b></span>').join('') + '</div></div>';
      }
      h += '</div>';
    }

    // desempenho por tema (com subtemas)
    if (!temaUnico) {
      h += '<div class="rel-sec">Desempenho por tema</div><div class="rel-temas">';
      temas.sort((a, b) => a.pct - b.pct || b.total - a.total).forEach(t => {
        const n = nivel(t.pct);
        h += '<details class="rel-tema ' + n + '"><summary>' +
             '<span class="rel-tema-nome">' + esc(t.nome) + '</span>' +
             '<span class="rel-bar"><span style="width:' + t.pct + '%"></span></span>' +
             '<span class="rel-tema-num">' + t.ok + '/' + t.total + '</span></summary><ul class="rel-subs">';
        [...t.subs.values()].sort((a, b) => (a.ok / a.total) - (b.ok / b.total)).forEach(s => {
          const okAll = s.ok === s.total;
          h += '<li class="' + (okAll ? 'ok' : 'err') + '"><span>' + esc(s.nome) + '</span><span>' + s.ok + '/' + s.total + '</span></li>';
        });
        h += '</ul></details>';
      });
      h += '</div>';
    } else {
      h += '<div class="rel-sec">Desempenho por subtema</div><div class="rel-temas"><div class="rel-tema open"><ul class="rel-subs">';
      [...temas[0].subs.values()].sort((a, b) => (a.ok / a.total) - (b.ok / b.total)).forEach(s => {
        h += '<li class="' + (s.ok === s.total ? 'ok' : 'err') + '"><span>' + esc(s.nome) + '</span><span>' + s.ok + '/' + s.total + '</span></li>';
      });
      h += '</ul></div></div>';
    }

    if (erradas.length) {
      h += '<div class="rel-sec">Questões que você errou</div><div class="rel-wrong">';
      erradas.forEach(e => {
        const label = (temaUnico ? '' : esc(e.q.tema || '') + ' › ') + esc(e.q.sub || '');
        h += '<button class="rel-wrong-item" onclick="' + goto + '(' + e.i + ')"><span class="rel-qn">Q' + e.q.n + '</span>' +
             '<span class="rel-qt">' + label + '</span><span class="rel-go">rever →</span></button>';
      });
      h += '</div>';
    }
    h += '</section>';
    return h;
  }

  window.Relatorio = { html: html };
})();
