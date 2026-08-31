(function () {
  const URL  = 'https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1';
  const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaGFocWljcWxyZHZjcGVzaXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTI3OTYsImV4cCI6MjEwMjI4ODc5Nn0.7ACHuUUv6VMyy4-BbQcdAcmabMtqhiuVgrTGUUcV7RY';
  const H    = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

  const NIVEIS = [
    { nivel: 1, nome: 'Iniciante',    xp: 0    },
    { nivel: 2, nome: 'Aprendiz',     xp: 200  },
    { nivel: 3, nome: 'Operador',     xp: 500  },
    { nivel: 4, nome: 'Analista',     xp: 1000 },
    { nivel: 5, nome: 'Especialista', xp: 2000 },
    { nivel: 6, nome: 'Sênior',       xp: 3500 },
    { nivel: 7, nome: 'Master ERP',   xp: 5000 },
  ];

  const BADGES_DEF = [
    { slug: 'bem_vindo',       emoji: '🏁', nome: 'Bem-vindo',          check: async (uid) => await _missoesConcluidas(uid) >= 3 },
    { slug: 'mestre_compras',  emoji: '🛒', nome: 'Mestre das Compras', check: async (uid) => await _eventosConcluidos(uid, ['solicitacao_criada','pedido_compra_criado','recebimento_registrado','nota_fiscal_compra_lancada']) },
    { slug: 'guardiao_estoque',emoji: '📦', nome: 'Guardião do Estoque',check: async (uid) => await _eventosConcluidos(uid, ['movimentacao_estoque','inventario_realizado']) },
    { slug: 'vendedor_expert', emoji: '💼', nome: 'Vendedor Expert',    check: async (uid) => await _eventosConcluidos(uid, ['pedido_venda_criado','expedicao_confirmada','entrega_confirmada']) },
    { slug: 'erp_completo',    emoji: '🌟', nome: 'ERP Completo',       check: async (uid) => await _missoesConcluidas(uid) >= 12 },
    { slug: 'velocista',       emoji: '⚡', nome: 'Velocista',          check: async (uid) => await _cincoMissoes24h(uid) },
    { slug: 'lider_turma',     emoji: '🏆', nome: 'Líder da Turma',     check: async (uid) => await _liderGrupo(uid) },
  ];

  async function _get(path) {
    const r = await fetch(`${URL}/${path}`, { headers: H });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function _post(path, body) {
    const r = await fetch(`${URL}/${path}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function _patch(path, body) {
    const r = await fetch(`${URL}/${path}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  function _uid() { return localStorage.getItem('erp_user_id'); }

  function _calcularNivel(xp) {
    let atual = NIVEIS[0];
    for (const n of NIVEIS) { if (xp >= n.xp) atual = n; else break; }
    return atual;
  }

  function _percentual(xp) {
    const atual = _calcularNivel(xp);
    const idx   = NIVEIS.findIndex(n => n.nivel === atual.nivel);
    const prox  = NIVEIS[idx + 1];
    if (!prox) return 100;
    return Math.round(((xp - atual.xp) / (prox.xp - atual.xp)) * 100);
  }

  async function _missoesConcluidas(uid) {
    const rows = await _get(`gamif_progresso?usuario_id=eq.${uid}&concluida=eq.true&select=id`);
    return rows.length;
  }

  async function _eventosConcluidos(uid, eventos) {
    for (const ev of eventos) {
      const missoes = await _get(`gamif_missoes?evento=eq.${ev}&ativo=eq.true&select=id`);
      if (!missoes.length) continue;
      const ids = missoes.map(m => m.id).join(',');
      const prog = await _get(`gamif_progresso?usuario_id=eq.${uid}&missao_id=in.(${ids})&concluida=eq.true&select=id`);
      if (!prog.length) return false;
    }
    return true;
  }

  async function _cincoMissoes24h(uid) {
    const limite = new Date(Date.now() - 86400000).toISOString();
    const rows   = await _get(`gamif_progresso?usuario_id=eq.${uid}&concluida=eq.true&concluida_em=gte.${limite}&select=id`);
    return rows.length >= 5;
  }

  async function _liderGrupo(uid) {
    const grupos = await _get(`gamif_usuario_grupo?usuario_id=eq.${uid}&select=grupo_id`);
    if (!grupos.length) return false;
    const gid    = grupos[0].grupo_id;
    const membros = await _get(`gamif_usuario_grupo?grupo_id=eq.${gid}&select=usuario_id`);
    if (membros.length < 2) return false;
    const ids    = membros.map(m => m.usuario_id).join(',');
    const perfis = await _get(`gamif_perfil?usuario_id=in.(${ids})&order=xp_total.desc&limit=1&select=usuario_id`);
    return perfis.length > 0 && perfis[0].usuario_id === uid;
  }

  async function _garantirPerfil(uid) {
    const rows = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
    if (rows.length) return rows[0];
    await _post('gamif_perfil', { usuario_id: uid, xp_total: 0, nivel: 1 });
    return { xp_total: 0, nivel: 1 };
  }

  async function _inicializarMissoesOnboarding(uid) {
    const missoes = await _get(`gamif_missoes?tipo=eq.onboarding&ativo=eq.true&select=id`);
    for (const m of missoes) {
      const existe = await _get(`gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${m.id}&select=id`);
      if (!existe.length) {
        await _post('gamif_progresso', { usuario_id: uid, missao_id: m.id, progresso: 0, concluida: false });
      }
    }
  }

  async function _verificarBadges(uid) {
    const badges = await _get(`gamif_badges?usuario_id=eq.${uid}&select=badge_slug`);
    const jaGanhou = new Set(badges.map(b => b.badge_slug));
    const novos = [];
    for (const def of BADGES_DEF) {
      if (jaGanhou.has(def.slug)) continue;
      const ganhou = await def.check(uid);
      if (ganhou) {
        await _post('gamif_badges', { usuario_id: uid, badge_slug: def.slug });
        novos.push(def);
      }
    }
    return novos;
  }

  function _toast(titulo, subtitulo, extra) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:99999;
      background:var(--color-surface,#fff); color:var(--color-text,#111);
      border:1px solid var(--color-border,#ddd); border-radius:12px;
      box-shadow:0 8px 32px rgba(0,0,0,.18); padding:14px 18px;
      min-width:260px; max-width:320px; animation:gamifSlide .3s ease;
      font-family:inherit;
    `;
    el.innerHTML = `
      <div style="font-weight:700;font-size:14px;margin-bottom:4px">🎯 ${titulo}</div>
      <div style="font-size:13px;color:var(--color-text-muted,#666)">${subtitulo}</div>
      ${extra ? `<div style="font-size:12px;color:var(--color-primary,#0043a4);margin-top:4px;font-weight:600">${extra}</div>` : ''}
    `;
    if (!document.getElementById('gamif-style')) {
      const s = document.createElement('style');
      s.id = 'gamif-style';
      s.textContent = `@keyframes gamifSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  async function registrarEvento(evento) {
    const uid = _uid();
    if (!uid) return;
    try {
      await _garantirPerfil(uid);
      await _inicializarMissoesOnboarding(uid);

      const missoes = await _get(`gamif_missoes?evento=eq.${evento}&ativo=eq.true&select=id,titulo,meta,xp`);
      if (!missoes.length) return;

      for (const missao of missoes) {
        const rows = await _get(`gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}&select=id,progresso,concluida`);
        if (!rows.length) {
          await _post('gamif_progresso', { usuario_id: uid, missao_id: missao.id, progresso: 1, concluida: false });
          var prog = { id: null, progresso: 1, concluida: false };
          // buscar o id recém-criado
          const criado = await _get(`gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}&select=id,progresso,concluida`);
          if (criado.length) prog = criado[0];
        } else {
          prog = rows[0];
        }
        if (prog.concluida) continue;

        const novoProgresso = prog.progresso + (rows.length ? 1 : 0);
        const concluida     = novoProgresso >= missao.meta;

        await _patch(`gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}`, {
          progresso:    novoProgresso,
          concluida,
          concluida_em: concluida ? new Date().toISOString() : null,
        });

        if (concluida) {
          const perfil    = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
          const xpAtual   = perfil[0]?.xp_total ?? 0;
          const novoXp    = xpAtual + missao.xp;
          const nivelAntes = _calcularNivel(xpAtual);
          const nivelDepois = _calcularNivel(novoXp);

          await _patch(`gamif_perfil?usuario_id=eq.${uid}`, {
            xp_total:   novoXp,
            nivel:      nivelDepois.nivel,
            updated_at: new Date().toISOString(),
          });

          const extra = nivelDepois.nivel > nivelAntes.nivel
            ? `🎉 Nível ${nivelDepois.nivel} — ${nivelDepois.nome} atingido!`
            : `+${missao.xp} XP • Total: ${novoXp} XP`;

          _toast('Missão concluída!', missao.titulo, extra);

          const novosBadges = await _verificarBadges(uid);
          for (const b of novosBadges) {
            setTimeout(() => _toast(`Badge desbloqueado! ${b.emoji}`, b.nome, ''), 1000);
          }
        }
      }
    } catch (e) {
      console.warn('[gamif] Erro ao registrar evento:', e.message);
    }
  }

  async function carregarPerfil() {
    const uid = _uid();
    if (!uid) return null;
    await _garantirPerfil(uid);
    await _inicializarMissoesOnboarding(uid);
    const perfil  = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
    const badges  = await _get(`gamif_badges?usuario_id=eq.${uid}&select=badge_slug`);
    const xp      = perfil[0]?.xp_total ?? 0;
    const nivel   = _calcularNivel(xp);
    return {
      xp_total:   xp,
      nivel:      nivel.nivel,
      nome_nivel: nivel.nome,
      percentual: _percentual(xp),
      badges:     badges.map(b => b.badge_slug),
      BADGES_DEF,
      NIVEIS,
    };
  }

  window.gamif = { registrarEvento, carregarPerfil, NIVEIS, BADGES_DEF };
})();
