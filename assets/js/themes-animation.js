const CLUSTER_URL = new URL('../../data/theme_clusters.json', import.meta.url).href;

const palette = ['#60a5fa', '#f59e0b', '#34d399', '#c084fc', '#f472b6', '#22d3ee', '#fb7185', '#4ade80', '#f97316', '#a78bfa'];

const els = {
  svg: document.getElementById('clusterSvg'),
  empty: document.getElementById('emptyState'),
  tooltip: document.getElementById('clusterTooltip'),
  programLegend: document.getElementById('taProgramLegend'),
  topThemesList: document.getElementById('topThemesList'),
  clusterList: document.getElementById('clusterList'),
  selectedThemeTitle: document.getElementById('selectedThemeTitle'),
  selectedThemeMeta: document.getElementById('selectedThemeMeta'),
  selectedThemeRelated: document.getElementById('selectedThemeRelated'),
  yearRangeChip: document.getElementById('taYearRangeChip'),
  themeCountChip: document.getElementById('taThemeCountChip'),
  kpiMentions: document.getElementById('taKpiMentions'),
  kpiGrowth: document.getElementById('taKpiGrowth'),
  kpiClusters: document.getElementById('taKpiClusters'),
  kpiDiversity: document.getElementById('taKpiDiversity'),
  impactBars: document.getElementById('taImpactBars'),
  trendSvg: document.getElementById('taTrendSvg'),
  risingList: document.getElementById('taRisingList'),
  storyModeBtn: document.getElementById('taStoryModeBtn'),
  storyHeadline: document.getElementById('taStoryHeadline'),
  storyBody: document.getElementById('taStoryBody'),
  storyMeta: document.getElementById('taStoryMeta'),
  exportImpactPngBtn: document.getElementById('taExportImpactPngBtn'),
  exportTrendPngBtn: document.getElementById('taExportTrendPngBtn'),
  exportCsvBtn: document.getElementById('taExportCsvBtn'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  prevYearBtn: document.getElementById('prevYearBtn'),
  nextYearBtn: document.getElementById('nextYearBtn'),
  yearSlider: document.getElementById('yearSlider'),
  yearLabel: document.getElementById('yearLabel'),
  speedSelect: document.getElementById('speedSelect'),
  themeSearchInput: document.getElementById('themeSearchInput'),
  minMentionsInput: document.getElementById('minMentionsInput'),
  minMentionsLabel: document.getElementById('minMentionsLabel'),
  clusterFilterSelect: document.getElementById('clusterFilterSelect'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  linkDashboard: document.getElementById('taLinkDashboard'),
  linkTimeline: document.getElementById('taLinkTimeline')
};

const state = {
  years: [],
  dataByYear: new Map(),
  fixedThemes: [],
  themeMeta: new Map(),
  yearIndex: 0,
  timer: null,
  simulation: null,
  width: 0,
  height: 0,
  selectedNodeId: null,
  visibleNodeIds: [],
  focusSelectedOnRender: false,
  pendingYearFromUrl: null,
  rawClusterPayload: null,
  lastInsightYear: null,
  lastInsightNodes: [],
  storyModeEnabled: false,
  storyTimer: null,
  storyNotes: [],
  storyPreviousClusterFilter: 'all',
  programColorScale: null
};

function setLinkHref(baseView, params = {}) {
  const search = new URLSearchParams({ view: baseView });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== '' && String(value) !== 'all') {
      search.set(key, String(value));
    }
  });
  return `?${search.toString()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildData(clusterPayload) {
  const fixedThemes = Array.isArray(clusterPayload.fixed_themes)
    ? clusterPayload.fixed_themes.map(String)
    : [];

  const themeMeta = new Map(
    Object.entries(clusterPayload.theme_meta || {}).map(([theme, meta]) => [
      String(theme),
      {
        category: String(meta?.category || 'Cross-cutting'),
        keywords: Array.isArray(meta?.keywords) ? meta.keywords.map(String) : []
      }
    ])
  );

  const years = (clusterPayload.years || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const byYear = new Map();

  years.forEach((year) => {
    const yearKey = String(year);
    const yearThemes = clusterPayload.by_year?.[yearKey] || {};
    const themeNames = fixedThemes.length
      ? fixedThemes
      : Object.keys(yearThemes).sort((a, b) => a.localeCompare(b));

    const nodes = [];
    const clusters = [];

    themeNames.forEach((themeName, idx) => {
      const color = palette[idx % palette.length];
      const themeItems = (yearThemes[themeName] || []).slice(0, 14);
      const meta = themeMeta.get(themeName) || { category: 'Cross-cutting', keywords: [] };

      const clusterTotal = themeItems.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
      clusters.push({
        id: idx,
        color,
        lead: themeName,
        category: meta.category,
        size: themeItems.length,
        total: clusterTotal
      });

      themeItems.forEach((item, itemIndex) => {
        const programCounts = Array.isArray(item.program_counts)
          ? item.program_counts.map((p) => ({
            program: String(p.program || 'Unknown Programme'),
            count: Number(p.count) || 0
          }))
          : [];

        nodes.push({
          id: `${year}-${themeName}-${item.label}-${itemIndex}`,
          tag: item.label,
          count: Number(item.count) || 0,
          cluster: idx,
          color,
          theme: themeName,
          category: meta.category,
          topProgram: String(item.top_program || programCounts[0]?.program || 'Unknown Programme'),
          programCounts
        });
      });
    });

    byYear.set(year, { nodes, links: [], clusters });
  });

  return { years, byYear, fixedThemes: themeNamesFromPayloadOrData(fixedThemes, byYear), themeMeta };
}

function themeNamesFromPayloadOrData(fixedThemes, byYear) {
  if (fixedThemes.length) return fixedThemes;
  const yearEntry = byYear.values().next().value;
  const fallback = (yearEntry?.clusters || []).map((c) => c.lead);
  return fallback;
}

function setupSvg() {
  const box = els.svg.getBoundingClientRect();
  state.width = box.width;
  state.height = box.height;
}

function ensureProgramColorScale(nodes = []) {
  if (state.programColorScale) return;
  const seedPrograms = [...new Set(nodes.map((n) => n.topProgram).filter(Boolean))];
  state.programColorScale = d3.scaleOrdinal()
    .domain(seedPrograms)
    .range([
      '#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be123c', '#65a30d', '#4f46e5', '#0f766e', '#9333ea'
    ]);
}

function getProgramColor(programName) {
  if (!state.programColorScale) {
    ensureProgramColorScale();
  }
  const safeName = String(programName || 'Unknown Programme');
  return state.programColorScale(safeName);
}

function renderProgramLegend(nodes) {
  if (!els.programLegend) return;

  const programs = [...d3.rollup(nodes, (v) => d3.sum(v, (d) => d.count), (d) => d.topProgram).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (!programs.length) {
    els.programLegend.innerHTML = '<span class="ta-program-legend-label">Ring = Programme</span><span class="ta-program-legend-empty">No programme signal for current filters.</span>';
    return;
  }

  const chips = programs
    .map(([program, mentions]) => `<span class="ta-program-chip"><span class="ta-program-chip-dot" style="background:${getProgramColor(program)}"></span>${escapeHtml(program)} · ${mentions}</span>`)
    .join('');

  els.programLegend.innerHTML = `<span class="ta-program-legend-label">Outer ring = programme</span>${chips}`;
}

function currentFilterState() {
  const query = String(els.themeSearchInput?.value || '').trim().toLowerCase();
  const minMentions = Math.max(1, Number(els.minMentionsInput?.value || 1));
  const clusterFilter = String(els.clusterFilterSelect?.value || 'all');
  return { query, minMentions, clusterFilter };
}

function populateClusterFilterOptions(clusters) {
  if (!els.clusterFilterSelect) return;
  const previous = String(els.clusterFilterSelect.value || 'all');

  const options = ['<option value="all">All clusters</option>'];
  clusters.forEach((c) => {
    options.push(`<option value="${c.id}">${escapeHtml(c.lead)} · ${escapeHtml(c.category || 'Cross-cutting')} (${c.size})</option>`);
  });

  els.clusterFilterSelect.innerHTML = options.join('');
  const canKeepPrevious = previous === 'all' || clusters.some((c) => String(c.id) === previous);
  els.clusterFilterSelect.value = canKeepPrevious ? previous : 'all';
}

function showTooltip(event, node) {
  if (!els.tooltip) return;
  const topPrograms = (node.programCounts || [])
    .slice(0, 2)
    .map((p) => `${escapeHtml(p.program)} (${p.count})`)
    .join(' · ');
  const programLine = topPrograms || escapeHtml(node.topProgram || 'Unknown Programme');

  els.tooltip.innerHTML = `<strong>${escapeHtml(node.tag)}</strong><br>${escapeHtml(node.theme)} · ${escapeHtml(node.category || 'Cross-cutting')}<br>${node.count} mentions<br><span class="ta-tooltip-program">Programme: ${programLine}</span>`;
  els.tooltip.classList.remove('hidden');

  const cardBox = els.svg.parentElement?.getBoundingClientRect();
  if (!cardBox) return;

  const left = event.clientX - cardBox.left + 12;
  const top = event.clientY - cardBox.top + 12;
  els.tooltip.style.left = `${left}px`;
  els.tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (!els.tooltip) return;
  els.tooltip.classList.add('hidden');
}

function renderSelectedTheme(selectedNode, allVisibleNodes, year) {
  if (!selectedNode) {
    els.selectedThemeTitle.textContent = 'No theme selected';
    els.selectedThemeMeta.textContent = 'Click a bubble to inspect details.';
    els.selectedThemeRelated.innerHTML = '';
    return;
  }

  els.selectedThemeTitle.textContent = selectedNode.tag;
  const topPrograms = (selectedNode.programCounts || [])
    .slice(0, 3)
    .map((p) => `${p.program} (${p.count})`)
    .join(' · ');
  els.selectedThemeMeta.textContent = `${year} · ${selectedNode.theme} · ${selectedNode.category || 'Cross-cutting'} · ${selectedNode.count} mentions · ${topPrograms || selectedNode.topProgram || 'Unknown Programme'}`;

  const related = allVisibleNodes
    .filter((n) => n.cluster === selectedNode.cluster && n.id !== selectedNode.id)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  els.selectedThemeRelated.innerHTML = related
    .map((n) => `<li><strong>${escapeHtml(n.tag)}</strong> (${n.count}) <span style="color:#6b7280">· ${escapeHtml(n.topProgram || 'Unknown Programme')}</span></li>`)
    .join('') || '<li>No related themes in current filters.</li>';
}

function clusterCenters(nodes) {
  const clusterIds = [...new Set(nodes.map((n) => n.cluster))];
  const radius = Math.min(state.width, state.height) * 0.26;
  const centerX = state.width / 2;
  const centerY = state.height / 2;
  const map = new Map();

  clusterIds.forEach((id, i) => {
    const angle = (i / Math.max(1, clusterIds.length)) * Math.PI * 2;
    map.set(id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius * 0.72
    });
  });

  return map;
}

function getFilteredNodesForYear(year) {
  const payload = state.dataByYear.get(year) || { nodes: [] };
  const { query, minMentions, clusterFilter } = currentFilterState();

  return payload.nodes
    .filter((d) => d.count >= minMentions)
    .filter((d) => !query || d.tag.toLowerCase().includes(query) || d.theme.toLowerCase().includes(query))
    .filter((d) => clusterFilter === 'all' || String(d.cluster) === clusterFilter)
    .map((d) => ({ ...d }));
}

function getRawNodesForYear(year) {
  const payload = state.dataByYear.get(year) || { nodes: [] };
  return payload.nodes.map((d) => ({ ...d }));
}

function renderImpactBars(nodes) {
  if (!els.impactBars) return;
  const svg = d3.select(els.impactBars);
  svg.selectAll('*').remove();

  const box = els.impactBars.getBoundingClientRect();
  const width = Math.max(280, box.width || 480);
  const height = Math.max(180, box.height || 220);
  const margin = { top: 10, right: 10, bottom: 30, left: 130 };

  const byTheme = d3.rollups(nodes, (v) => d3.sum(v, (d) => d.count), (d) => d.theme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!byTheme.length) return;

  const x = d3.scaleLinear()
    .domain([0, d3.max(byTheme, (d) => d[1]) || 1])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(byTheme.map((d) => d[0]))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.append('g')
    .selectAll('rect')
    .data(byTheme)
    .join('rect')
    .attr('x', margin.left)
    .attr('y', (d) => y(d[0]))
    .attr('height', y.bandwidth())
    .attr('width', (d) => x(d[1]) - margin.left)
    .attr('fill', '#f59e0b')
    .attr('rx', 6);

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(4).tickSizeOuter(0))
    .call((g) => g.selectAll('text').attr('font-size', 11))
    .call((g) => g.selectAll('path,line').attr('stroke', '#d1d5db'));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call((g) => g.selectAll('text').attr('font-size', 11))
    .call((g) => g.selectAll('path,line').attr('stroke', '#d1d5db'));
}

function renderTrendChart() {
  if (!els.trendSvg) return;
  const svg = d3.select(els.trendSvg);
  svg.selectAll('*').remove();

  const box = els.trendSvg.getBoundingClientRect();
  const width = Math.max(280, box.width || 480);
  const height = Math.max(180, box.height || 220);
  const margin = { top: 12, right: 12, bottom: 28, left: 42 };

  const series = state.years.map((year) => {
    const nodes = getFilteredNodesForYear(year);
    return { year, mentions: d3.sum(nodes, (d) => d.count) };
  });

  if (!series.length) return;

  const x = d3.scalePoint()
    .domain(series.map((d) => d.year))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(series, (d) => d.mentions) || 1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x((d) => x(d.year))
    .y((d) => y(d.mentions));

  svg.append('path')
    .datum(series)
    .attr('fill', 'none')
    .attr('stroke', '#111827')
    .attr('stroke-width', 2)
    .attr('d', line);

  svg.append('g')
    .selectAll('circle')
    .data(series)
    .join('circle')
    .attr('cx', (d) => x(d.year))
    .attr('cy', (d) => y(d.mentions))
    .attr('r', 3.8)
    .attr('fill', '#f59e0b');

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.selectAll('text').attr('font-size', 11))
    .call((g) => g.selectAll('path,line').attr('stroke', '#d1d5db'));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
    .call((g) => g.selectAll('text').attr('font-size', 11))
    .call((g) => g.selectAll('path,line').attr('stroke', '#d1d5db'));
}

function computeThemeDiversification(nodes) {
  const byTheme = d3.rollups(nodes, (v) => d3.sum(v, (d) => d.count), (d) => d.theme);
  const total = d3.sum(byTheme, (d) => d[1]);
  const n = byTheme.length;

  if (!total || n <= 1) return null;

  const hhi = d3.sum(byTheme, (d) => {
    const p = d[1] / total;
    return p * p;
  });

  const normalized = (1 - hhi) / (1 - 1 / n);
  return Math.max(0, Math.min(1, normalized));
}

function getTagMap(nodes) {
  return d3.rollup(nodes, (v) => d3.sum(v, (d) => d.count), (d) => d.tag);
}

function getClusterMap(nodes) {
  return d3.rollup(
    nodes,
    (v) => ({
      id: v[0]?.cluster ?? null,
      name: v[0]?.theme || 'Unknown cluster',
      color: v[0]?.color || '#f59e0b',
      count: d3.sum(v, (d) => d.count),
      topThemes: [...v]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((d) => ({ tag: d.tag, count: d.count }))
    }),
    (d) => d.cluster
  );
}

function buildStoryNotes() {
  const notes = state.years.map((year, idx) => {
    const current = getRawNodesForYear(year);
    const currentTagMap = getTagMap(current);
    const currentClusterMap = [...getClusterMap(current).entries()]
      .map(([clusterId, cluster]) => ({ clusterId, ...cluster }))
      .sort((a, b) => b.count - a.count);
    const mentions = d3.sum(current, (d) => d.count);
    const dominantCluster = currentClusterMap[0] || null;
    const runnerUpCluster = currentClusterMap[1] || null;

    if (idx === 0) {
      return {
        year,
        headline: `${year}: baseline cluster profile`,
        body: dominantCluster
          ? `The dominant cluster is ${dominantCluster.name} with ${dominantCluster.count} mentions (${Math.round((dominantCluster.count / Math.max(1, mentions)) * 100)}% of the year).`
          : `This is the first tracked year in the selected filters with ${mentions} mentions.`,
        dominantClusterId: dominantCluster?.clusterId ?? null,
        dominantClusterName: dominantCluster?.name || null,
        dominantClusterColor: dominantCluster?.color || '#f59e0b',
        dominantClusterCount: dominantCluster?.count || 0,
        dominantClusterShare: dominantCluster ? dominantCluster.count / Math.max(1, mentions) : 0,
        topThemes: dominantCluster?.topThemes || [],
        shiftLine: 'Baseline year for comparison.'
      };
    }

    const prevYear = state.years[idx - 1];
    const prev = getRawNodesForYear(prevYear);
    const prevTagMap = getTagMap(prev);
    const prevClusterMap = [...getClusterMap(prev).entries()]
      .map(([clusterId, cluster]) => ({ clusterId, ...cluster }))
      .sort((a, b) => b.count - a.count);

    const deltas = [...currentTagMap.entries()].map(([tag, count]) => ({
      tag,
      delta: count - (prevTagMap.get(tag) || 0)
    }));

    const up = deltas.filter((d) => d.delta > 0).sort((a, b) => b.delta - a.delta)[0] || null;
    const down = deltas.filter((d) => d.delta < 0).sort((a, b) => a.delta - b.delta)[0] || null;
    const dominantGain = currentClusterMap[0] && prevClusterMap[0]
      ? currentClusterMap.find((cluster) => cluster.name === prevClusterMap[0].name) || null
      : null;
    const clusterShift = currentClusterMap.find((cluster) => !prevClusterMap.some((prevCluster) => prevCluster.name === cluster.name))
      || currentClusterMap[0]
      || null;

    const headline = `${year}: ${dominantCluster ? dominantCluster.name : 'cluster shift'}`;
    const body = [
      dominantCluster
        ? `Dominant cluster: ${dominantCluster.name} (${dominantCluster.count} mentions, ${Math.round((dominantCluster.count / Math.max(1, mentions)) * 100)}% share).`
        : 'No dominant cluster identified.',
      clusterShift && clusterShift.name !== dominantCluster?.name
        ? `A notable cluster shift came from ${clusterShift.name}.`
        : '',
      up ? `Rising tag: ${up.tag} (+${up.delta}).` : '',
      down ? `Softening tag: ${down.tag} (${down.delta}).` : '',
      dominantGain ? `Compared with ${prevClusterMap[0]?.name || 'last year'}, the leading cluster stayed close to ${dominantGain.name}.` : ''
    ].filter(Boolean).join(' ');

    return {
      year,
      headline,
      body,
      dominantClusterId: dominantCluster?.clusterId ?? null,
      dominantClusterName: dominantCluster?.name || null,
      dominantClusterColor: dominantCluster?.color || '#f59e0b',
      dominantClusterCount: dominantCluster?.count || 0,
      dominantClusterShare: dominantCluster ? dominantCluster.count / Math.max(1, mentions) : 0,
      topThemes: dominantCluster?.topThemes || [],
      shiftLine: clusterShift
        ? `Focus cluster: ${clusterShift.name}.`
        : `Focus cluster: ${dominantCluster?.name || 'none'}.`
    };
  });

  state.storyNotes = notes;
}

function renderStoryPanel(year) {
  const note = state.storyNotes.find((n) => n.year === year) || null;
  if (els.storyHeadline) {
    els.storyHeadline.textContent = note?.headline || 'No story insight available for this year.';
  }
  if (els.storyBody) {
    els.storyBody.textContent = note?.body || '';
  }

  if (els.storyMeta) {
    if (!note) {
      els.storyMeta.innerHTML = '';
      return;
    }

    const shareText = Math.round((note.dominantClusterShare || 0) * 100);
    const themeTags = (note.topThemes || [])
      .slice(0, 3)
      .map((theme) => `<span class="ta-story-meta-chip">${escapeHtml(theme.tag)} · ${theme.count}</span>`)
      .join('');

    els.storyMeta.innerHTML = `
      <span class="ta-story-meta-chip" style="border-color:${note.dominantClusterColor || '#e5e7eb'}">${escapeHtml(note.dominantClusterName || 'Cluster')}</span>
      <span class="ta-story-meta-chip">${shareText}% of the year</span>
      <span class="ta-story-meta-chip">${note.dominantClusterCount || 0} mentions</span>
      ${themeTags}
    `;
  }
}

function stopStoryMode() {
  if (state.storyTimer) clearInterval(state.storyTimer);
  state.storyTimer = null;
  state.storyModeEnabled = false;
  if (els.clusterFilterSelect && state.storyPreviousClusterFilter !== null) {
    els.clusterFilterSelect.value = state.storyPreviousClusterFilter;
  }
  if (els.storyModeBtn) {
    els.storyModeBtn.classList.remove('is-active');
    els.storyModeBtn.textContent = 'Story mode';
  }
  if (els.storyModeBtnTop) {
    els.storyModeBtnTop.classList.remove('is-active');
    els.storyModeBtnTop.textContent = 'Story mode';
  }
}

function startStoryMode() {
  stopPlayback();
  buildStoryNotes();
  state.storyPreviousClusterFilter = String(els.clusterFilterSelect?.value || 'all');
  state.storyModeEnabled = true;
  if (els.storyModeBtn) {
    els.storyModeBtn.classList.add('is-active');
    els.storyModeBtn.textContent = 'Stop story';
  }
  const currentNote = state.storyNotes[state.yearIndex] || null;
  if (currentNote && currentNote.dominantClusterId !== null && els.clusterFilterSelect) {
    els.clusterFilterSelect.value = String(currentNote.dominantClusterId);
  }
  renderYear();

  state.storyTimer = setInterval(() => {
    if (!state.years.length) return;
    const next = state.yearIndex >= state.years.length - 1 ? 0 : state.yearIndex + 1;
    const nextYear = state.years[next];
    const nextNote = state.storyNotes.find((note) => note.year === nextYear) || null;
    if (nextNote && nextNote.dominantClusterId !== null && els.clusterFilterSelect) {
      els.clusterFilterSelect.value = String(nextNote.dominantClusterId);
    }
    setYearIndex(next);
  }, 2200);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportSvgAsPng(svgElement, filename) {
  if (!svgElement) return;
  const xml = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const w = Math.max(600, svgElement.clientWidth || 800);
    const h = Math.max(260, svgElement.clientHeight || 320);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
    }, 'image/png');
    URL.revokeObjectURL(url);
  };

  image.src = url;
}

function exportInsightsCsv() {
  const year = state.lastInsightYear;
  const nodes = state.lastInsightNodes || [];
  if (!year) return;

  const trend = state.years.map((y) => {
    const n = getFilteredNodesForYear(y);
    return { year: y, mentions: d3.sum(n, (d) => d.count) };
  });

  const lines = ['section,year,theme,tag,count'];
  nodes.forEach((n) => {
    lines.push(`current_year,${year},"${String(n.theme).replaceAll('"', '""')}","${String(n.tag).replaceAll('"', '""')}",${n.count}`);
  });
  trend.forEach((t) => {
    lines.push(`trend,${t.year},,,${t.mentions}`);
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `themes-insights-${year}.csv`);
}

function renderInsights(currentYear, nodes) {
  state.lastInsightYear = currentYear;
  state.lastInsightNodes = nodes;

  const mentionsNow = d3.sum(nodes, (d) => d.count);
  const activeClusters = new Set(nodes.map((d) => d.theme)).size;
  const diversification = computeThemeDiversification(nodes);

  const currentIdx = state.years.indexOf(currentYear);
  const prevYear = currentIdx > 0 ? state.years[currentIdx - 1] : null;
  const prevMentions = prevYear ? d3.sum(getFilteredNodesForYear(prevYear), (d) => d.count) : 0;
  const growth = prevYear && prevMentions > 0
    ? ((mentionsNow - prevMentions) / prevMentions) * 100
    : null;

  if (els.kpiMentions) els.kpiMentions.textContent = `${mentionsNow}`;
  if (els.kpiClusters) els.kpiClusters.textContent = `${activeClusters}`;
  if (els.kpiDiversity) {
    els.kpiDiversity.textContent = diversification === null ? '—' : `${Math.round(diversification * 100)} / 100`;
  }
  if (els.kpiGrowth) {
    els.kpiGrowth.textContent = growth === null ? '—' : `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%`;
  }

  renderImpactBars(nodes);
  renderTrendChart();

  if (els.risingList) {
    const nowByTag = d3.rollup(nodes, (v) => d3.sum(v, (d) => d.count), (d) => d.tag);
    const prevNodes = prevYear ? getFilteredNodesForYear(prevYear) : [];
    const prevByTag = d3.rollup(prevNodes, (v) => d3.sum(v, (d) => d.count), (d) => d.tag);

    const rising = [...nowByTag.entries()]
      .map(([tag, count]) => ({ tag, delta: count - (prevByTag.get(tag) || 0) }))
      .filter((d) => d.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 6);

    els.risingList.innerHTML = rising
      .map((d) => `<li><strong>${escapeHtml(d.tag)}</strong> <span style="color:#6b7280">(+${d.delta})</span></li>`)
      .join('') || '<li>No rising themes for current filters.</li>';
  }

  buildStoryNotes();
  renderStoryPanel(currentYear);
}

function renderYear() {
  const year = state.years[state.yearIndex];
  const payload = state.dataByYear.get(year) || { nodes: [], links: [], clusters: [] };
  populateClusterFilterOptions(payload.clusters || []);

  const nodes = getFilteredNodesForYear(year);

  const visibleClusterIds = new Set(nodes.map((n) => n.cluster));
  const visibleClusters = (payload.clusters || []).filter((c) => visibleClusterIds.has(c.id));
  state.visibleNodeIds = nodes.map((n) => n.id);
  const links = [];

  if (els.themeCountChip) {
    els.themeCountChip.textContent = `Visible themes: ${nodes.length}`;
  }

  els.yearLabel.textContent = year ?? '—';
  els.empty.classList.toggle('hidden', nodes.length > 0);

  const svg = d3.select(els.svg);
  svg.selectAll('*').remove();

  if (!nodes.length) {
    renderTopThemes([]);
    renderClusterSummary([]);
    renderSelectedTheme(null, [], year);
    renderProgramLegend([]);
    renderInsights(year, []);
    return;
  }

  const g = svg.append('g');
  const centers = clusterCenters(nodes);

  const rScale = d3.scaleSqrt()
    .domain([1, d3.max(nodes, (d) => d.count) || 1])
    .range([8, 48]);

  nodes.forEach((n) => {
    const c = centers.get(n.cluster) || { x: state.width / 2, y: state.height / 2 };
    n.x = c.x + (Math.random() - 0.5) * 30;
    n.y = c.y + (Math.random() - 0.5) * 30;
    n.r = rScale(n.count);
  });

  ensureProgramColorScale(nodes);

  const linkSel = g.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-opacity', (d) => Math.min(0.45, 0.08 + d.weight * 0.04))
    .attr('stroke-width', (d) => Math.min(2.2, 0.6 + d.weight * 0.25));

  const ringSel = g.selectAll('circle.ta-program-ring')
    .data(nodes, (d) => d.id)
    .join('circle')
    .attr('class', 'ta-program-ring')
    .attr('r', (d) => d.r + 4)
    .attr('fill', 'none')
    .attr('stroke', (d) => getProgramColor(d.topProgram))
    .attr('stroke-width', 2.8)
    .attr('stroke-opacity', 0.95)
    .attr('pointer-events', 'none');

  const circleSel = g.selectAll('circle.ta-node')
    .data(nodes, (d) => d.id)
    .join('circle')
    .attr('class', 'ta-node')
    .attr('r', (d) => d.r)
    .attr('fill', (d) => d.color)
    .attr('fill-opacity', 0.84)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.2)
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => `${d.tag}, ${d.theme}, ${d.category || 'Cross-cutting'}, ${d.count} mentions, programme ${d.topProgram || 'Unknown Programme'}`)
    .on('mouseenter', (event, d) => showTooltip(event, d))
    .on('mousemove', (event, d) => showTooltip(event, d))
    .on('mouseleave', hideTooltip)
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        state.selectedNodeId = d.id;
        state.focusSelectedOnRender = true;
        renderYear();
      }
    })
    .on('click', (_, d) => {
      state.selectedNodeId = d.id;
      renderYear();
    });

  const textSel = g.selectAll('text')
    .data(nodes, (d) => d.id)
    .join('text')
    .text((d) => d.tag)
    .attr('text-anchor', 'middle')
    .attr('font-size', (d) => Math.max(10, Math.min(14, d.r * 0.32)))
    .attr('font-weight', 700)
    .attr('fill', '#111827')
    .attr('paint-order', 'stroke')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('pointer-events', 'none');

  if (state.simulation) {
    state.simulation.stop();
  }

  state.simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX((d) => (centers.get(d.cluster) || { x: state.width / 2 }).x).strength(0.12))
    .force('y', d3.forceY((d) => (centers.get(d.cluster) || { y: state.height / 2 }).y).strength(0.12))
    .force('charge', d3.forceManyBody().strength(-35))
    .force('collide', d3.forceCollide((d) => d.r + 2).strength(0.9))
    .alpha(0.95)
    .alphaDecay(0.035)
    .on('tick', () => {
      linkSel
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      circleSel.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      ringSel.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      textSel.attr('x', (d) => d.x).attr('y', (d) => d.y + 3);
    });

  renderTopThemes(nodes);
  renderProgramLegend(nodes);

  const selectedNode = nodes.find((n) => n.id === state.selectedNodeId) || nodes[0] || null;
  if (selectedNode) {
    state.selectedNodeId = selectedNode.id;
  }
  renderSelectedTheme(selectedNode, nodes, year);

  updateCrossViewLinks();
  renderInsights(year, nodes);
  const storyNote = state.storyNotes.find((note) => note.year === year) || null;
  renderClusterSummary(visibleClusters, storyNote?.dominantClusterId ?? null);

  circleSel
    .attr('stroke-width', (d) => (d.id === state.selectedNodeId ? 2.6 : 1.2))
    .attr('stroke', (d) => (d.id === state.selectedNodeId ? '#111827' : '#fff'));

  ringSel
    .attr('stroke-width', (d) => (d.id === state.selectedNodeId ? 4 : 2.8))
    .attr('stroke-opacity', (d) => (d.id === state.selectedNodeId ? 1 : 0.95));

  if (state.focusSelectedOnRender && state.selectedNodeId) {
    const selectedEl = circleSel.filter((d) => d.id === state.selectedNodeId).node();
    if (selectedEl && typeof selectedEl.focus === 'function') {
      selectedEl.focus();
    }
    state.focusSelectedOnRender = false;
  }
}

function updateCrossViewLinks() {
  const year = state.years[state.yearIndex];
  const filters = currentFilterState();
  const selectedNode = state.selectedNodeId ? state.visibleNodeIds.includes(state.selectedNodeId) : false;
  const selectedText = selectedNode
    ? String(state.selectedNodeId).split('-').slice(2, -1).join('-')
    : '';

  const params = {
    year,
    q: filters.query,
    min: filters.minMentions,
    cluster: filters.clusterFilter,
    theme: selectedText
  };

  if (els.linkDashboard) {
    els.linkDashboard.href = setLinkHref('dashboard', { year, q: filters.query });
  }
  if (els.linkTimeline) {
    els.linkTimeline.href = setLinkHref('timeline', params);
  }
}

function applyFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const min = params.get('min');
  const cluster = params.get('cluster');
  const year = params.get('year');

  if (q) {
    els.themeSearchInput.value = q;
  }
  if (min && Number.isFinite(Number(min))) {
    const bounded = Math.max(1, Math.min(30, Number(min)));
    els.minMentionsInput.value = String(bounded);
    els.minMentionsLabel.textContent = `${bounded}+`;
  }
  if (cluster) {
    els.clusterFilterSelect.value = cluster;
  }
  if (year && Number.isFinite(Number(year))) {
    state.pendingYearFromUrl = Number(year);
  }
}

function renderTopThemes(nodes) {
  const top = [...nodes].sort((a, b) => b.count - a.count).slice(0, 12);
  els.topThemesList.innerHTML = top
    .map((d) => `<li><strong>${escapeHtml(d.tag)}</strong> (${d.count}) <span style="color:#6b7280">· ${escapeHtml(d.theme)} · ${escapeHtml(d.topProgram || 'Unknown Programme')}</span></li>`)
    .join('') || '<li>No themes in current filters.</li>';
}

function renderClusterSummary(clusters, highlightedClusterId = null) {
  const activeCluster = String(els.clusterFilterSelect?.value || 'all');
  els.clusterList.innerHTML = clusters
    .map((c) => {
      const isActive = activeCluster !== 'all' && activeCluster === String(c.id);
      const isHighlighted = highlightedClusterId !== null && String(highlightedClusterId) === String(c.id);
      return `<li><button class="ta-cluster-btn ${isActive ? 'is-active' : ''} ${isHighlighted ? 'is-story-focus' : ''}" type="button" data-cluster-id="${c.id}"><span class="dot" style="background:${c.color}"></span><strong>${escapeHtml(c.lead)}</strong> <span class="ta-cluster-category">${escapeHtml(c.category || 'Cross-cutting')}</span> · ${c.size} themes · ${c.total} mentions</button></li>`;
    })
    .join('') || '<li>No clusters in current filters.</li>';
}

function selectNodeByOffset(offset) {
  if (!state.visibleNodeIds.length) return;

  const currentIndex = state.visibleNodeIds.indexOf(state.selectedNodeId);
  const safeCurrent = currentIndex >= 0 ? currentIndex : 0;
  const next = Math.max(0, Math.min(state.visibleNodeIds.length - 1, safeCurrent + offset));
  state.selectedNodeId = state.visibleNodeIds[next];
  state.focusSelectedOnRender = true;
  renderYear();
}

function setYearIndex(index) {
  if (!state.years.length) return;
  state.yearIndex = Math.max(0, Math.min(state.years.length - 1, index));
  els.yearSlider.value = String(state.yearIndex);
  renderYear();
}

function stopPlayback() {
  if (state.timer) {
    clearInterval(state.timer);
  }
  state.timer = null;
  els.playPauseBtn.textContent = 'Play';
}

function startPlayback() {
  stopStoryMode();
  stopPlayback();
  const speed = Number(els.speedSelect.value) || 1100;
  els.playPauseBtn.textContent = 'Pause';

  state.timer = setInterval(() => {
    if (state.yearIndex >= state.years.length - 1) {
      stopPlayback();
      return;
    }
    setYearIndex(state.yearIndex + 1);
  }, speed);
}

function bindEvents() {
  els.playPauseBtn.addEventListener('click', () => {
    if (state.timer) {
      stopPlayback();
      return;
    }
    startPlayback();
  });

  els.prevYearBtn.addEventListener('click', () => {
    stopStoryMode();
    stopPlayback();
    setYearIndex(state.yearIndex - 1);
  });

  els.nextYearBtn.addEventListener('click', () => {
    stopStoryMode();
    stopPlayback();
    setYearIndex(state.yearIndex + 1);
  });

  els.yearSlider.addEventListener('input', (event) => {
    stopStoryMode();
    stopPlayback();
    setYearIndex(Number(event.target.value));
  });

  els.speedSelect.addEventListener('change', () => {
    if (state.timer) {
      startPlayback();
    }
  });

  els.themeSearchInput.addEventListener('input', () => {
    stopStoryMode();
    stopPlayback();
    renderYear();
  });

  els.minMentionsInput.addEventListener('input', () => {
    els.minMentionsLabel.textContent = `${els.minMentionsInput.value}+`;
    stopStoryMode();
    stopPlayback();
    renderYear();
  });

  els.clusterFilterSelect.addEventListener('change', () => {
    stopStoryMode();
    stopPlayback();
    renderYear();
  });

  els.clusterList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const btn = target.closest('[data-cluster-id]');
    if (!btn) return;

    const clusterId = String(btn.getAttribute('data-cluster-id') || 'all');
    if (els.clusterFilterSelect.value === clusterId) {
      els.clusterFilterSelect.value = 'all';
    } else {
      els.clusterFilterSelect.value = clusterId;
    }
    stopStoryMode();
    stopPlayback();
    renderYear();
  });

  els.resetFiltersBtn.addEventListener('click', () => {
    els.themeSearchInput.value = '';
    els.minMentionsInput.value = '1';
    els.minMentionsLabel.textContent = '1+';
    els.clusterFilterSelect.value = 'all';
    state.selectedNodeId = null;
    stopStoryMode();
    renderYear();
  });

  if (els.storyModeBtn) {
    els.storyModeBtn.addEventListener('click', () => {
      if (state.storyModeEnabled) {
        stopStoryMode();
        renderYear();
      } else {
        startStoryMode();
      }
    });
  }

  if (els.exportImpactPngBtn) {
    els.exportImpactPngBtn.addEventListener('click', () => {
      const year = state.lastInsightYear || state.years[state.yearIndex] || 'year';
      exportSvgAsPng(els.impactBars, `impact-by-cluster-${year}.png`);
    });
  }

  if (els.exportTrendPngBtn) {
    els.exportTrendPngBtn.addEventListener('click', () => {
      exportSvgAsPng(els.trendSvg, 'mentions-trend.png');
    });
  }

  if (els.exportCsvBtn) {
    els.exportCsvBtn.addEventListener('click', () => {
      exportInsightsCsv();
    });
  }

  window.addEventListener('resize', () => {
    setupSvg();
    renderYear();
  });

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName.toLowerCase();
      const isEditable = tag === 'input' || tag === 'select' || tag === 'textarea' || target.isContentEditable;
      if (isEditable) return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectNodeByOffset(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectNodeByOffset(-1);
    }
  });
}

async function init() {
  setupSvg();
  bindEvents();
  els.minMentionsLabel.textContent = `${els.minMentionsInput.value}+`;
  applyFiltersFromUrl();

  const response = await fetch(CLUSTER_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load theme_clusters.json');
  }

  const clusterPayload = await response.json();
  const { years, byYear, fixedThemes, themeMeta } = buildData(clusterPayload);

  state.years = years;
  state.dataByYear = byYear;
  state.fixedThemes = fixedThemes;
  state.themeMeta = themeMeta;

  if (els.yearRangeChip) {
    const rangeText = years.length ? `${years[0]} → ${years[years.length - 1]}` : '—';
    els.yearRangeChip.textContent = `Years: ${rangeText}`;
  }

  if (!years.length) {
    els.empty.classList.remove('hidden');
    els.yearLabel.textContent = '—';
    return;
  }

  els.yearSlider.max = String(years.length - 1);
  const urlYearIndex = state.pendingYearFromUrl !== null ? years.indexOf(state.pendingYearFromUrl) : -1;
  const initialIndex = urlYearIndex >= 0 ? urlYearIndex : 0;
  els.yearSlider.value = String(initialIndex);
  setYearIndex(initialIndex);
}

init().catch((error) => {
  console.error(error);
  els.empty.classList.remove('hidden');
  els.empty.textContent = 'Could not load data.';
});
