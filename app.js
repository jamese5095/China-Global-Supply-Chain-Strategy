(() => {
  'use strict';
  const D = window.STRATEGY_DATA;
  const main = document.getElementById('main');
  const dialog = document.getElementById('evidence-dialog');
  const sourceMap = new Map(D.sources.map(s => [s.id, s]));
  const state = { region: '', industry: '' };
  let previousRoute = '';
  let evidenceOpener;
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name, cls = '') => {
    const paths = { arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', back: '<path d="M20 12H5m6-6-6 6 6 6"/>', external: '<path d="M14 4h6v6m0-6L10 14M20 14v6H4V4h6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>', document: '<path d="M14 3H5v18h14V8zm0 0v5h5M8 12h8M8 16h6"/>', check: '<path d="m5 12 4 4L19 6"/>', route: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 4h8"/>', layers: '<path d="m12 3 10 6-10 6L2 9zm-9 11 9 5 9-5M3 18l9 5 9-5"/>' };
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  };
  const sourceLabels = {sf:'顺丰年报',customers:'客户记录',luxshare:'立讯项目','anker-report':'安克年报','anker-shipping':'安克配送规则','anker-returns':'安克退货规则',midea:'美的中报',sitc:'SITC公告',luckin:'瑞幸年报',schaerer:'Schaerer官网',dhl:'DHL布局',xpo:'XPO案例',sany:'三一欧洲',mixue:'蜜雪年报'};
  const sources = (ids, compact = false) => `<span class="source-links">${[...new Set(ids)].map(id => {
    const s = sourceMap.get(id);
    return s ? `<button class="source-link ${compact ? 'compact' : ''}" data-source="${E(id)}" title="查看依据：${E(s.title)}" aria-label="查看依据：${E(s.title)}">${icon('document')}${E(compact ? sourceLabels[id] || s.publisher : s.title)}${icon('external')}</button>` : '';
  }).join('')}</span>`;
  const tag = (text, cls = '') => `<span class="tag ${cls}">${E(text)}</span>`;
  const miniFlow = s => `<div class="mini-flow">${s.flow.map((n, i) => `${i ? icon('arrow') : ''}<span>${E(n.name)}</span>`).join('')}</div>`;
  function strategyCard(s) {
    return `<article class="strategy-card ${E(s.tone)}" data-strategy="${E(s.id)}">
      <div class="card-meta"><span class="region-label">${E(s.region)}</span>${tag(s.status, s.tone)}</div>
      <h3><a href="#strategy/${E(s.id)}">${E(s.title)}</a></h3>
      <p class="card-summary">${E(s.summary)}</p>
      ${miniFlow(s)}
      <div class="card-detail"><span>目标客户</span><p>${s.customers.map(E).join('、')}</p></div>
      <div class="card-detail"><span>建设重点</span><p>${E(s.investment)}</p></div>
      <div class="card-bottom"><span>${icon('check')}${E(s.logic)}</span><a class="open-strategy" href="#strategy/${E(s.id)}">查看推导 ${icon('arrow')}</a></div>
    </article>`;
  }
  function tradeCards() {
    const num = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return D.trade.map(t => {
      const max = Math.max(t.exports, t.imports);
      return `<article class="trade-card"><div class="trade-head"><h3>${E(t.industry)}</h3><span>${E(t.scope)}</span></div>
        ${[['出口', t.exports, 'export'], ['进口', t.imports, 'import']].map(([label, amount, cls]) => `<div class="trade-row"><span>${label}</span><div class="trade-track"><i class="${cls}" style="width:${amount / max * 100}%"></i></div><strong>${num(amount)}</strong></div>`).join('')}
        <p>${E(t.meaning)}</p></article>`;
    }).join('');
  }
  function updateGrid() {
    const selected = D.strategies.filter(s => (!state.region || s.region === state.region) && (!state.industry || s.industries.includes(state.industry)));
    document.getElementById('strategy-grid').innerHTML = selected.length ? selected.map(strategyCard).join('') : `<div class="empty-state">这个组合暂无已完成的建设建议。<button class="text-button" data-reset>清除筛选，查看全部方向</button></div>`;
    document.getElementById('result-count').textContent = `${selected.length} 个方向`;
    document.getElementById('reset-filters').hidden = !state.region && !state.industry;
  }
  function renderHome() {
    document.title = D.title;
    main.innerHTML = `<section class="home-hero">
      <div class="hero-copy"><div class="eyebrow">STRATEGY & EVIDENCE <span></span> 结论与依据</div><h1>中国企业出海，<br>供应链能力建在哪里<span class="title-dot">。</span></h1><p class="hero-subtitle">从客户业务与实际货流，推导可进入的服务和能力建设选择。</p></div>
      <aside class="hero-judgment"><span class="small-label">本轮建设判断</span><p>北越做制造补给，<br>德国做品牌履约。</p><div>泰国围绕已有节点扩展；<br>进口业务沿中国买方采购关系延伸。</div><a href="#recommendations">查看建设建议 ${icon('arrow')}</a></aside>
    </section>
    <div class="logic-strip" aria-label="论证顺序"><span>贸易背景</span>${icon('arrow')}<span>客户与货流</span>${icon('arrow')}<span>服务需求</span>${icon('arrow')}<span>进入条件</span>${icon('arrow')}<b>能力建设</b></div>
    <section class="recommendations section" id="recommendations" aria-labelledby="recommendations-title">
      <div class="section-heading"><div><div class="eyebrow">WHERE TO BUILD</div><h2 id="recommendations-title">从可进入的业务，形成建设选择</h2><p>三个建设方向与一条进口线索。点击方向，沿证据查看完整推导。</p></div></div>
      <div class="filter-bar"><div class="filter-controls"><label>地区<select id="region-filter"><option value="">全部地区</option>${[...new Set(D.strategies.map(s => s.region))].map(r => `<option ${state.region === r ? 'selected' : ''}>${E(r)}</option>`).join('')}</select></label><label>行业<select id="industry-filter"><option value="">全部相关行业</option>${[...new Set(D.strategies.flatMap(s => s.industries))].map(i => `<option ${state.industry === i ? 'selected' : ''}>${E(i)}</option>`).join('')}</select></label><button id="reset-filters" class="text-button" data-reset hidden>清除筛选</button></div><span id="result-count" class="result-count" aria-live="polite"></span></div>
      <div class="strategy-grid" id="strategy-grid"></div>
      <p class="section-note">顺序综合客户基础、实际货流、可进入范围与现有交付经验；不代表市场规模或投资回报排名。</p>
    </section>
    <section class="trade-section section" id="trade" aria-labelledby="trade-title">
      <div class="section-heading"><div><div class="eyebrow">TRADE CONTEXT</div><h2 id="trade-title">进出口额，说明研究的业务背景</h2><p>2025年全年 · 单位：亿美元 · 各图独立比例，保留代表商品口径。</p></div><button class="outline-button" data-source="trade-input">口径与依据 ${icon('document')}</button></div>
      <div class="trade-legend"><span><i class="export"></i>出口</span><span><i class="import"></i>进口</span></div>
      <div class="trade-grid">${tradeCards()}</div>
      <div class="trade-context-note">贸易规模帮助识别研究方向。具体国家、可委托货流与当地作业，仍由客户和项目证据确定；企业海外本地产销另行研究。</div>
    </section>
    <section class="method-section section" id="method" aria-labelledby="method-title"><div class="section-heading"><div><div class="eyebrow">HOW THE CONCLUSION IS BUILT</div><h2 id="method-title">每一类依据，都有明确作用</h2><p>客户需求与顺丰进入条件共同支撑建设建议。</p></div></div>
      <div class="evidence-role-grid">
        <article><span class="role-index">01</span><h3>贸易数据</h3><p>识别代表商品规模与方向，为研究提供背景。</p><small>不直接换算仓位与物流收入</small></article>
        <article><span class="role-index">02</span><h3>客户资料</h3><p>确认已有商务关系和可追踪的客户入口。</p><small>国内合作与海外委托分别确认</small></article>
        <article><span class="role-index">03</span><h3>客户与承接商证据</h3><p>确认生产、货流、当地履约及采购分工。</p><small>现有设施与新业务分别识别</small></article>
        <article><span class="role-index">04</span><h3>顺丰交付与成本条件</h3><p>判断可以复用什么、还需补什么及投入边界。</p><small>扩容以合同和实际贡献支撑</small></article>
      </div>
      <div class="method-bottom"><b>建设取舍</b><span>内部掌握客户、方案、系统和质量；当地执行优先复用或合作，关键短板与稳定业务同时明确后再评估并购。</span></div>
    </section>`;
    updateGrid();
    document.getElementById('region-filter').addEventListener('change', e => { state.region = e.target.value; updateGrid(); });
    document.getElementById('industry-filter').addEventListener('change', e => { state.industry = e.target.value; updateGrid(); });
  }
  const sectionHeader = (n, title, caption, kind) => `<div class="proof-section-heading"><span class="step-number">${n}</span><div><h2>${title}</h2><p>${caption}</p></div>${tag(kind, 'kind')}</div>`;
  function renderDetail(s) {
    document.title = `${s.shortTitle} · 国际供应链战略研究`;
    const i = D.strategies.indexOf(s);
    const trade = D.trade.filter(t => s.trade.includes(t.industry));
    main.innerHTML = `<div class="detail-intro"><a class="back-link" href="#home">${icon('back')} 所有战略建议</a><div class="detail-kicker"><span>${E(s.region)}</span>${tag(s.status, s.tone)}${s.industries.map(v => tag(v)).join('')}</div><h1>${E(s.title)}</h1><p class="detail-lead">${E(s.summary)}</p><div class="location-line">${icon('route')}${E(s.location)}</div></div>
      <div class="decision-strip"><div><span>目标客户</span><b>${s.customers.map(E).join('、')}</b></div><div><span>建设重点</span><b>${E(s.investment)}</b></div><div><span>进入方式</span><b>${E(s.method)}</b></div></div>
      <nav class="step-nav" aria-label="建议推导步骤">${['客户变化','具体货流','服务需求','进入条件','建设选择','决策结论'].map((v, j) => `<button data-scroll="proof-${j + 1}"><span>${j + 1}</span>${v}</button>`).join('')}</nav>
      <div class="detail-layout"><div class="proof-main">
        <section id="proof-1" class="proof-section">${sectionHeader('01', '客户发生了什么变化', '先确认经营与供应链事实，再判断机会。', '事实')}
          <div class="facts-list">${s.facts.map(f => `<div class="fact-item"><span class="fact-bullet"></span><div><p>${E(f.text)}</p>${sources(f.sources)}</div></div>`).join('')}</div>
        </section>
        <section id="proof-2" class="proof-section">${sectionHeader('02', '从哪里，到哪里', '把业务变化还原成可以研究和报价的服务链路。', '货流与目标链路')}
          <div class="flow-diagram">${s.flow.map((n, j) => `${j ? `<div class="flow-arrow">${icon('arrow')}</div>` : ''}<div class="flow-node"><span>${String(j + 1).padStart(2, '0')}</span><h3>${E(n.name)}</h3><p>${E(n.detail)}</p></div>`).join('')}</div><p class="flow-note">${E(s.flowNote)}</p>${sources(s.flowSources)}
        </section>
        <section id="proof-3" class="proof-section">${sectionHeader('03', '货流形成哪些服务需求', '将事实转成具体作业，逐步扩大可承接服务。', '分析判断')}
          <div class="needs-list">${s.needs.map((n, j) => `<article><span>${j + 1}</span><div><h3>${E(n.name)}</h3><p>${E(n.reason)}</p>${sources(n.sources, true)}</div></article>`).join('')}</div>
        </section>
        <section id="proof-4" class="proof-section">${sectionHeader('04', '顺丰凭什么进入', '客户入口、已有基础与实际采购范围同时成立。', '事实 + 判断')}
          <div class="entry-list">${s.entry.map((n, j) => `<article class="entry-item entry-${j}"><h3>${icon(j === 2 ? 'layers' : 'check')}${E(n.name)}</h3><p>${E(n.text)}</p>${sources(n.sources, true)}</article>`).join('')}</div>
        </section>
        <section id="proof-5" class="proof-section">${sectionHeader('05', '具体补齐什么能力', '从已有基础出发，逐项对应建设内容与获取方式。', '建设建议')}
          <div class="build-list">${s.build.map(n => `<article class="build-item"><div class="build-title"><h3>${E(n.name)}</h3>${tag(n.method, 'method-tag')}</div><div class="build-columns"><div><small>已有基础</small><p>${E(n.base)}</p></div><div><small>需要补齐</small><p>${E(n.gap)}</p></div></div>${sources(n.sources, true)}</article>`).join('')}</div>
        </section>
        <section id="proof-6" class="proof-section final-decision">${sectionHeader('06', '现在可以决定什么', '建设方向与资产投入分别作出判断。', '决策结论')}
          <h3 class="decision-statement">${E(s.decision.statement)}</h3><div class="decision-rows"><div><b>当前动作</b><p>${E(s.decision.now)}</p></div><div><b>投入条件</b><p>${E(s.decision.condition)}</p></div><div><b>范围边界</b><p>${E(s.decision.boundary)}</p></div></div>
          <div class="cost-box"><span class="small-label">经济性判断</span><h4>${E(s.decision.costUnit)}</h4><p>${E(s.decision.costRule)}</p><small>约定业务量 × 单位贡献，应覆盖新增固定成本、资金与风险成本，并满足集团回报要求。当前资料不支持填入目标单价或回本年限。</small></div>
        </section>
        <div class="detail-pagination">${i > 0 ? `<a href="#strategy/${E(D.strategies[i - 1].id)}">${icon('back')} ${E(D.strategies[i - 1].shortTitle)}</a>` : '<span></span>'}${i < D.strategies.length - 1 ? `<a href="#strategy/${E(D.strategies[i + 1].id)}">${E(D.strategies[i + 1].shortTitle)} ${icon('arrow')}</a>` : '<a href="#home">返回总览 →</a>'}</div>
      </div><aside class="proof-sidebar"><div class="sidebar-inner"><div class="sidebar-title"><h2>本建议的依据</h2><span>${s.sources.length} 项</span></div><p class="sidebar-caption">点击查看来源、支持范围与适用条件。</p><div class="evidence-index">${s.sources.map(id => { const src = sourceMap.get(id); return `<button data-source="${E(id)}"><span class="source-kind">${E(src.kind)}</span><b>${E(src.title)}</b><small>${E(src.date)}</small>${icon('external')}</button>`; }).join('')}</div><div class="sidebar-trade"><h3>贸易背景如何使用</h3><p>${trade.map(t => E(t.scope)).join('；')}仅提供宏观背景，本建议的地区与作业选择来自客户及项目资料。</p><button class="text-button" data-source="trade-input">查看统计口径 ${icon('arrow')}</button></div></div></aside></div>`;
  }
  function showEvidence(id, opener) {
    const s = sourceMap.get(id);
    if (!s) return;
    evidenceOpener = opener;
    document.getElementById('evidence-content').innerHTML = `<div class="drawer-top"><span class="eyebrow">EVIDENCE NOTE</span><button class="icon-button" data-close-evidence aria-label="关闭依据">${icon('close')}</button></div>${tag(s.kind, 'kind')}<h2 id="evidence-title">${E(s.title)}</h2><div class="source-meta"><span>${E(s.publisher)}</span><span>${E(s.date)}</span></div><p class="source-locator">${E(s.locator)}</p><div class="evidence-answer"><span>这份依据支持什么</span><p>${E(s.supports)}</p></div><div class="evidence-limit"><span>使用范围</span><p>${E(s.limit)}</p></div>${s.url ? `<a class="primary-button" href="${E(s.url)}" target="_blank" rel="noopener noreferrer">打开原始依据 ${icon('external')}</a>` : `<div class="internal-source-note">${s.id === 'customers' ? '页面只呈现研究所需的客户关系摘要，未提供客户原表与收入明细。' : '金额沿用本次提供的汇总图，统计口径随图保留。'}</div>`}<p class="drawer-footnote">事实用于支持分析判断，建设建议与实际业务委托分别确认。</p>`;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function closeEvidence() { dialog.close(); }
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); evidenceOpener?.focus({ preventScroll: true }); });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeEvidence(); } });
  document.addEventListener('click', e => {
    const src = e.target.closest('[data-source]');
    if (src) return showEvidence(src.dataset.source, src);
    if (e.target.closest('[data-close-evidence]')) return closeEvidence();
    if (e.target.closest('[data-reset]')) { state.region = ''; state.industry = ''; document.getElementById('region-filter').value = ''; document.getElementById('industry-filter').value = ''; return updateGrid(); }
    const scroll = e.target.closest('[data-scroll]');
    if (scroll) document.getElementById(scroll.dataset.scroll)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  function route() {
    if (dialog.open) closeEvidence();
    const hash = location.hash.slice(1) || 'home';
    const detailId = hash.startsWith('strategy/') ? hash.split('/')[1] : '';
    const s = D.strategies.find(x => x.id === detailId);
    if (detailId && !s) { location.replace('#home'); return; }
    const current = s ? s.id : 'home';
    if (current !== previousRoute || !main.children.length) {
      s ? renderDetail(s) : renderHome();
      previousRoute = current;
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.focus({ preventScroll: true });
    }
    document.querySelectorAll('.site-header nav a').forEach(a => { const active = hash === a.hash.slice(1) || (s && a.hash === '#home'); active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    if (['trade', 'method', 'recommendations'].includes(hash)) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: 'start' }));
    else if (!s && hash === 'home') window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', route);
  route();
})();
