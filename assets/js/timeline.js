const DATA_URL = new URL('../../data/all_programs.json', import.meta.url).href;
const THEME_DATA_URL = new URL('../../data/theme_clusters.json', import.meta.url).href;
const START_DATE = new Date('2021-01-01T00:00:00Z');

const els = {
  pageWrap: document.querySelector('.tl-page-wrap'),
  progressCard: document.querySelector('.tl-progress-card'),
  playPauseBtn: document.getElementById('tlPlayPauseBtn'),
  startBtn: document.getElementById('tlStartBtn'),
  prevBtn: document.getElementById('tlPrevBtn'),
  nextBtn: document.getElementById('tlNextBtn'),
  endBtn: document.getElementById('tlEndBtn'),
  slider: document.getElementById('tlSlider'),
  dateLabel: document.getElementById('tlDateLabel'),
  speedSelect: document.getElementById('tlSpeedSelect'),
  currentDateBadge: document.getElementById('tlCurrentDateBadge'),
  rangeEnd: document.getElementById('tlRangeEnd'),
  axisTicks: document.getElementById('tlAxisTicks'),
  axisMarker: document.getElementById('tlAxisMarker'),
  monthDots: document.getElementById('tlMonthDots'),
  dotTooltip: document.getElementById('tlDotTooltip'),
  totalCount: document.getElementById('tlTotalCount'),
  monthCount: document.getElementById('tlMonthCount'),
  programmeCount: document.getElementById('tlProgrammeCount'),
  monthHeadline: document.getElementById('tlMonthHeadline'),
  monthSub: document.getElementById('tlMonthSub'),
  monthTypeChips: document.getElementById('tlMonthTypeChips'),
  monthPublications: document.getElementById('tlMonthPublications'),
  milestones: document.getElementById('tlMilestones'),
  typeList: document.getElementById('tlTypeList'),
  selectedTitle: document.getElementById('tlSelectedTitle'),
  selectedMeta: document.getElementById('tlSelectedMeta'),
  selectedDetails: document.getElementById('tlSelectedDetails'),
  selectedSummary: document.getElementById('tlSelectedSummary'),
  selectedActions: document.getElementById('tlSelectedActions'),
  heroOutputs: document.getElementById('tlHeroOutputs'),
  heroRange: document.getElementById('tlHeroRange'),
  linkDashboard: document.getElementById('tlLinkDashboard'),
  linkThemes: document.getElementById('tlLinkThemes'),
  programmeFilter: document.getElementById('tlProgrammeFilter'),
  contentTypeFilter: document.getElementById('tlContentTypeFilter'),
  themeFilter: document.getElementById('tlThemeFilter'),
  resetFiltersBtn: document.getElementById('tlResetFiltersBtn'),
  filterStatus: document.getElementById('tlFilterStatus')
};

const state = {
  allRecords: [],
  records: [],
  themeMeta: {},
  monthMarks: [],
  monthActivity: new Map(),
  monthRecords: new Map(),
  maxMonthActivity: 1,
  index: 0,
  lastRenderedIndex: -1,
  effectTimer: null,
  timer: null,
  selectedRecordId: null,
  queryFilter: '',
  pendingYearFromUrl: null,
  pendingMonthFromUrl: null,
  pendingFilters: {}
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

function monthKey(dateObj) {
  return `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}`;
}

function parseDate(record) {
  const raw = String(record.Date || '').trim();
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const py = String(record['Publication Year'] || '').trim();
  if (/^\d{4}$/.test(py)) {
    return new Date(`${py}-01-01T00:00:00Z`);
  }

  return null;
}

function normalizeContentType(record) {
  const raw = String(record['Content Type'] || record.contentType || record.content_type || record['Item Type'] || '').trim();
  if (!raw) return 'Publication';
  if (raw.toLowerCase() === 'webpage') return 'Webpage';
  if (raw.toLowerCase() === 'report') return 'Report';
  return raw;
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(';').map((item) => item.trim()).filter(Boolean);
}

function inferThemes(record) {
  const haystack = [
    record.Title,
    record['Abstract Note'],
    ...asArray(record['Manual Tags']),
    record['Automatic Tags']
  ].join(' ').toLowerCase();

  return Object.entries(state.themeMeta)
    .filter(([, meta]) => (meta.keywords || []).some((keyword) => {
      const normalized = String(keyword).toLowerCase().trim();
      if (!normalized) return false;
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])${escaped}`, 'i').test(haystack);
    }))
    .map(([theme]) => theme);
}

function populateFilter(select, values, allLabel) {
  if (!select) return;
  const current = select.value || 'all';
  select.innerHTML = `<option value="all">${escapeHtml(allLabel)}</option>${[...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join('')}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : 'all';
}

function updateFilterOptions() {
  populateFilter(els.programmeFilter, state.allRecords.map((record) => record.programme), 'All programmes');
  populateFilter(els.contentTypeFilter, state.allRecords.map((record) => record.contentType), 'All content types');
  populateFilter(els.themeFilter, Object.keys(state.themeMeta), 'All themes');
}

function applyTimelineFilters({ preserveMonth = true } = {}) {
  const currentKey = preserveMonth && state.monthMarks[state.index] ? monthKey(state.monthMarks[state.index]) : null;
  const programme = els.programmeFilter?.value || 'all';
  const contentType = els.contentTypeFilter?.value || 'all';
  const theme = els.themeFilter?.value || 'all';

  state.records = state.allRecords.filter((record) => {
    if (programme !== 'all' && record.programme !== programme) return false;
    if (contentType !== 'all' && record.contentType !== contentType) return false;
    if (theme !== 'all' && !record.themes.includes(theme)) return false;
    return true;
  });

  buildMonthActivity();
  renderMonthDots();
  const restoredIndex = currentKey
    ? state.monthMarks.findIndex((date) => monthKey(date) === currentKey)
    : state.monthMarks.length - 1;
  state.index = restoredIndex >= 0 ? restoredIndex : Math.max(0, state.monthMarks.length - 1);
  if (els.slider) els.slider.value = String(state.index);

  const activeCount = [programme, contentType, theme].filter((value) => value !== 'all').length;
  if (els.filterStatus) {
    els.filterStatus.textContent = activeCount
      ? `${state.records.length} matching output${state.records.length === 1 ? '' : 's'} · ${activeCount} active filter${activeCount === 1 ? '' : 's'}`
      : `Showing all ${state.records.length} outputs`;
  }
  if (els.heroOutputs) els.heroOutputs.textContent = `Outputs: ${state.records.length}`;
  state.selectedRecordId = null;
  render();
}

function buildMonthMarks(minDate, maxDate) {
  const marks = [];
  const cursor = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), 1));

  while (cursor <= end) {
    marks.push(new Date(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return marks;
}

function formatMonth(dateObj) {
  return dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function formatFullDate(dateObj) {
  return dateObj.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getExternalUrl(record) {
  const direct = String(record.url || '').trim();
  if (/^https?:\/\//i.test(direct)) return direct;

  const doi = String(record.doi || '').trim();
  if (/^https?:\/\//i.test(doi)) return doi;

  return '';
}

function renderAxisTicks() {
  if (!els.axisTicks || !state.monthMarks.length) return;

  const lastIndex = state.monthMarks.length - 1;
  const tickHtml = state.monthMarks
    .map((d, idx) => ({ d, idx }))
    .filter(({ d, idx }) => idx === 0 || idx === lastIndex || d.getUTCMonth() === 0)
    .map(({ d, idx }) => {
      const pct = lastIndex > 0 ? (idx / lastIndex) * 100 : 0;
      const label = idx === 0 || idx === lastIndex ? formatMonth(d) : String(d.getUTCFullYear());
      const edgeClass = idx === 0 ? ' is-edge-start' : (idx === lastIndex ? ' is-edge-end' : '');
      return `<span class="tl-axis-tick${edgeClass}" style="left:${pct}%"><span class="tl-axis-line"></span><span class="tl-axis-label">${label}</span></span>`;
    })
    .join('');

  els.axisTicks.innerHTML = tickHtml;
}

function buildMonthActivity() {
  const activity = new Map();
  const recordsByMonth = new Map();

  state.records.forEach((record) => {
    const key = monthKey(record.date);
    activity.set(key, (activity.get(key) || 0) + 1);

    const list = recordsByMonth.get(key) || [];
    list.push(record);
    recordsByMonth.set(key, list);
  });

  state.monthActivity = activity;
  state.monthRecords = recordsByMonth;
  state.maxMonthActivity = Math.max(1, ...activity.values());
}

function buildMonthTooltip(monthDate, count) {
  const key = monthKey(monthDate);
  const records = state.monthRecords.get(key) || [];
  const top = records
    .slice(0, 6)
    .map((r) => `• ${String(r.title || 'Untitled')}`);
  const moreCount = Math.max(0, records.length - top.length);
  if (moreCount > 0) {
    top.push(`• +${moreCount} more`);
  }

  return `${formatMonth(monthDate)}\n${count} publication${count === 1 ? '' : 's'}\n${top.join('\n')}`;
}

function moveDotTooltip(clientX, clientY) {
  if (!els.dotTooltip) return;

  const offset = 14;
  const pad = 10;
  const width = els.dotTooltip.offsetWidth || 280;
  const height = els.dotTooltip.offsetHeight || 90;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = clientX + offset;
  let top = clientY + offset;

  if (left + width + pad > vw) {
    left = Math.max(pad, clientX - width - offset);
  }
  if (top + height + pad > vh) {
    top = Math.max(pad, clientY - height - offset);
  }

  els.dotTooltip.style.left = `${left}px`;
  els.dotTooltip.style.top = `${top}px`;
}

function showDotTooltip(dotEl, event) {
  if (!els.dotTooltip) return;

  const text = dotEl.getAttribute('data-tooltip') || '';
  if (!text) return;

  els.dotTooltip.textContent = text;
  els.dotTooltip.setAttribute('aria-hidden', 'false');
  els.dotTooltip.classList.add('is-visible');
  moveDotTooltip(event.clientX, event.clientY);
}

function hideDotTooltip() {
  if (!els.dotTooltip) return;
  els.dotTooltip.classList.remove('is-visible');
  els.dotTooltip.setAttribute('aria-hidden', 'true');
}

function updatePlayfulState(current, snapshot, pct) {
  if (!els.pageWrap) return;

  const energy = Math.max(0, Math.min(1, snapshot.monthTotal / Math.max(1, state.maxMonthActivity)));

  els.pageWrap.style.setProperty('--tl-energy', energy.toFixed(3));
  els.pageWrap.style.setProperty('--tl-progress-pct', String(pct));

  els.pageWrap.classList.remove('tl-energy-low', 'tl-energy-medium', 'tl-energy-high');
  if (energy >= 0.66) els.pageWrap.classList.add('tl-energy-high');
  else if (energy >= 0.33) els.pageWrap.classList.add('tl-energy-medium');
  else els.pageWrap.classList.add('tl-energy-low');

  if (els.progressCard) {
    els.progressCard.classList.toggle('is-active-month', snapshot.monthTotal > 0);

    if (state.lastRenderedIndex !== state.index) {
      els.progressCard.classList.remove('tl-jolt');
      void els.progressCard.offsetWidth;
      els.progressCard.classList.add('tl-jolt');
      if (state.effectTimer) clearTimeout(state.effectTimer);
      state.effectTimer = window.setTimeout(() => {
        els.progressCard?.classList.remove('tl-jolt');
      }, 260);
    }
  }

  if (els.monthDots) {
    const activeDot = els.monthDots.querySelector('.tl-month-dot.is-current');
    if (activeDot instanceof HTMLElement) {
      activeDot.classList.remove('is-current');
    }

    const currentDot = els.monthDots.querySelector(`.tl-month-dot[data-index="${state.index}"]`);
    if (currentDot instanceof HTMLElement) {
      currentDot.classList.add('is-current');
    }
  }

  state.lastRenderedIndex = state.index;
}

function renderMonthDots() {
  if (!els.monthDots || !state.monthMarks.length) return;

  const lastIndex = state.monthMarks.length - 1;
  const maxCount = Math.max(1, ...state.monthActivity.values());

  const html = state.monthMarks
    .map((monthDate, idx) => {
      const key = monthKey(monthDate);
      const count = state.monthActivity.get(key) || 0;
      const height = count ? Math.max(7, Math.round((count / maxCount) * 58)) : 2;
      const tooltip = buildMonthTooltip(monthDate, count);
      const majorClass = count >= Math.max(2, Math.ceil(maxCount * 0.5)) ? ' is-major' : '';
      const emptyClass = count ? '' : ' is-empty';
      return `<button class="tl-month-dot tl-month-bar${majorClass}${emptyClass}" type="button" data-index="${idx}" data-tooltip="${escapeHtml(tooltip)}" aria-label="${escapeHtml(tooltip)}" style="height:${height}px;"></button>`;
    })
    .join('');

  els.monthDots.innerHTML = html;
}

function buildMeaningfulMilestones(upto) {
  if (!upto.length) return [];
  const ordered = [...upto].sort((a, b) => a.date - b.date);
  const milestones = [{
    date: ordered[0].date,
    title: 'First output in this timeline view',
    detail: ordered[0].title || 'Untitled'
  }];

  const firstByProgramme = new Map();
  ordered.forEach((record) => {
    if (!firstByProgramme.has(record.programme)) firstByProgramme.set(record.programme, record);
  });
  firstByProgramme.forEach((record, programme) => {
    milestones.push({
      date: record.date,
      title: `${programme} entered the timeline`,
      detail: record.title || 'First recorded output'
    });
  });

  [25, 50, 100, 150].forEach((threshold) => {
    if (ordered.length < threshold) return;
    const record = ordered[threshold - 1];
    milestones.push({
      date: record.date,
      title: `${threshold} cumulative outputs reached`,
      detail: record.title || 'Publication milestone'
    });
  });

  const activity = new Map();
  ordered.forEach((record) => {
    const key = monthKey(record.date);
    const item = activity.get(key) || { date: new Date(Date.UTC(record.date.getUTCFullYear(), record.date.getUTCMonth(), 1)), count: 0 };
    item.count += 1;
    activity.set(key, item);
  });
  const busiest = [...activity.values()].sort((a, b) => b.count - a.count || b.date - a.date)[0];
  if (busiest) {
    milestones.push({
      date: busiest.date,
      title: `Highest-output month: ${formatMonth(busiest.date)}`,
      detail: `${busiest.count} publication${busiest.count === 1 ? '' : 's'}`
    });
  }

  return milestones.sort((a, b) => b.date - a.date).slice(0, 7);
}

function computeSnapshot(atDate) {
  const monthStart = new Date(Date.UTC(atDate.getUTCFullYear(), atDate.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(atDate.getUTCFullYear(), atDate.getUTCMonth() + 1, 1));
  const monthEnd = new Date(nextMonth.getTime() - 1);

  const upto = state.records.filter((r) => r.date <= monthEnd);

  const inMonth = state.records.filter((r) => r.date >= monthStart && r.date < nextMonth);

  const byType = new Map();
  const monthByType = new Map();
  const byProgramme = new Map();
  const programmesActive = new Set();

  upto.forEach((r) => {
    byType.set(r.contentType, (byType.get(r.contentType) || 0) + 1);
    byProgramme.set(r.programme, (byProgramme.get(r.programme) || 0) + 1);
    programmesActive.add(r.programme);
  });

  const milestones = buildMeaningfulMilestones(upto);
  const latestRecord = upto.length ? [...upto].sort((a, b) => b.date - a.date)[0] : null;

  const monthPublications = [...inMonth]
    .sort((a, b) => a.date - b.date)
    .slice(0, 12);

  inMonth.forEach((r) => {
    monthByType.set(r.contentType, (monthByType.get(r.contentType) || 0) + 1);
  });

  const firstInMonth = inMonth.length ? [...inMonth].sort((a, b) => a.date - b.date)[0] : null;
  const lastInMonth = inMonth.length ? [...inMonth].sort((a, b) => b.date - a.date)[0] : null;

  return {
    total: upto.length,
    monthTotal: inMonth.length,
    programmesActive: programmesActive.size,
    monthByType: [...monthByType.entries()].sort((a, b) => b[1] - a[1]),
    byType: [...byType.entries()].sort((a, b) => b[1] - a[1]),
    byProgramme: [...byProgramme.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    monthPublications,
    firstInMonth,
    lastInMonth,
    latestRecord,
    milestones
  };
}

function render() {
  const current = state.monthMarks[state.index];
  if (els.dateLabel) {
    els.dateLabel.textContent = formatMonth(current);
  }
  if (els.currentDateBadge) {
    els.currentDateBadge.textContent = formatMonth(current);
  }

  const pct = state.monthMarks.length > 1 ? (state.index / (state.monthMarks.length - 1)) * 100 : 0;
  if (els.axisMarker) {
    els.axisMarker.style.left = `${pct}%`;
  }

  const snapshot = computeSnapshot(current);
  updatePlayfulState(current, snapshot, pct);

  els.totalCount.textContent = String(snapshot.total);
  els.monthCount.textContent = String(snapshot.monthTotal);
  els.programmeCount.textContent = String(snapshot.programmesActive);

  const currentMonthText = formatMonth(current);
  if (els.monthHeadline) {
    els.monthHeadline.textContent = `${snapshot.monthTotal} publication${snapshot.monthTotal === 1 ? '' : 's'} in ${currentMonthText}`;
  }
  if (els.monthSub) {
    if (snapshot.monthTotal > 0 && snapshot.firstInMonth && snapshot.lastInMonth) {
      els.monthSub.textContent = `From ${formatFullDate(snapshot.firstInMonth.date)} to ${formatFullDate(snapshot.lastInMonth.date)}.`;
    } else {
      els.monthSub.textContent = 'No publications in this month.';
    }
  }
  if (els.monthTypeChips) {
    els.monthTypeChips.innerHTML = snapshot.monthByType
      .slice(0, 5)
      .map(([type, count]) => `<span class="tl-chip"><strong>${escapeHtml(type)}</strong> ${count}</span>`)
      .join('') || '<span class="tl-chip">No content types</span>';
  }

  els.monthPublications.innerHTML = snapshot.monthPublications
    .map((p) => {
      const isSelected = p.id === state.selectedRecordId;
      const title = escapeHtml(p.title || 'Untitled');
      const programme = escapeHtml(p.programme || 'Unknown Programme');
      const dateText = escapeHtml(formatFullDate(p.date));
      return `<li class="${isSelected ? 'is-selected' : ''}"><button class="tl-pub-item" type="button" data-record-id="${p.id}" aria-pressed="${isSelected ? 'true' : 'false'}"><span class="tl-pub-date">${dateText}</span><span class="tl-pub-title">${title}</span><span class="tl-pub-programme">· ${programme}</span></button></li>`;
    })
    .join('') || '<li>No publications in this month.</li>';

  const selectedRecord = snapshot.monthPublications.find((r) => r.id === state.selectedRecordId)
    || snapshot.monthPublications[snapshot.monthPublications.length - 1]
    || snapshot.latestRecord
    || null;

  if (selectedRecord) {
    state.selectedRecordId = selectedRecord.id;
    const extUrl = getExternalUrl(selectedRecord);
    els.selectedTitle.textContent = selectedRecord.title || 'Untitled';
    els.selectedMeta.textContent = `${formatFullDate(selectedRecord.date)} · ${selectedRecord.programme || 'Unknown Programme'} · ${selectedRecord.contentType || 'Publication'}`;
    if (els.selectedDetails) {
      const detailRows = [
        ['Author', selectedRecord.author || 'Not specified'],
        ['Item type', selectedRecord.itemType || selectedRecord.contentType || 'Publication'],
        ['Themes', selectedRecord.themes.join(', ') || 'No matched theme'],
        ['Countries', selectedRecord.countries.join(', ') || 'Not specified']
      ];
      els.selectedDetails.innerHTML = detailRows
        .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
        .join('');
    }
    els.selectedSummary.textContent = selectedRecord.summary || 'No abstract available.';
    els.selectedActions.innerHTML = extUrl
      ? `<a class="tl-action-link" href="${escapeHtml(extUrl)}" target="_blank" rel="noopener noreferrer">Open publication ↗</a>`
      : '<span class="tl-action-link">No external link</span>';
  } else {
    els.selectedTitle.textContent = 'No publication selected';
    els.selectedMeta.textContent = 'Pick any publication from the list.';
    els.selectedSummary.textContent = '';
    if (els.selectedDetails) els.selectedDetails.innerHTML = '';
    els.selectedActions.innerHTML = '';
  }

  els.milestones.innerHTML = snapshot.milestones
    .map((milestone) => `<li class="tl-milestone"><time>${escapeHtml(formatFullDate(milestone.date))}</time><span><strong>${escapeHtml(milestone.title)}</strong><small>${escapeHtml(milestone.detail)}</small></span></li>`)
    .join('') || '<li>No milestones yet.</li>';

  els.typeList.innerHTML = snapshot.byType
    .map(([type, count]) => `<li><strong>${escapeHtml(type)}</strong>: ${count}</li>`)
    .join('') || '<li>No content types yet.</li>';

  updateCrossViewLinks(current);
}

function updateCrossViewLinks(currentMonthDate) {
  const monthToken = `${currentMonthDate.getUTCFullYear()}-${String(currentMonthDate.getUTCMonth() + 1).padStart(2, '0')}`;
  const params = {
    year: currentMonthDate.getUTCFullYear(),
    month: monthToken,
    q: state.queryFilter,
    program: els.programmeFilter?.value,
    contentType: els.contentTypeFilter?.value,
    theme: els.themeFilter?.value
  };

  if (els.linkDashboard) {
    els.linkDashboard.href = setLinkHref('dashboard', {
      year: currentMonthDate.getUTCFullYear(),
      q: state.queryFilter,
      program: els.programmeFilter?.value,
      contentType: els.contentTypeFilter?.value
    });
  }
  if (els.linkThemes) {
    els.linkThemes.href = setLinkHref('themes', params);
  }
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = String(params.get('q') || '').trim().toLowerCase();
  const year = params.get('year');
  const month = params.get('month');
  state.pendingFilters = {
    programme: params.get('program') || 'all',
    contentType: params.get('contentType') || 'all',
    theme: params.get('theme') || 'all'
  };

  state.queryFilter = q;

  if (year && Number.isFinite(Number(year))) {
    state.pendingYearFromUrl = Number(year);
  }

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    state.pendingMonthFromUrl = month;
  }
}

function setIndex(nextIndex) {
  state.index = Math.max(0, Math.min(state.monthMarks.length - 1, nextIndex));
  els.slider.value = String(state.index);
  render();
}

function stopPlayback() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
  els.playPauseBtn.textContent = 'Play';
  if (els.pageWrap) els.pageWrap.classList.remove('is-playing');
}

function startPlayback() {
  stopPlayback();
  els.playPauseBtn.textContent = 'Pause';
  if (els.pageWrap) els.pageWrap.classList.add('is-playing');
  const speed = Number(els.speedSelect.value) || 1100;

  state.timer = setInterval(() => {
    if (state.index >= state.monthMarks.length - 1) {
      stopPlayback();
      return;
    }
    setIndex(state.index + 1);
  }, speed);
}

function bindEvents() {
  els.playPauseBtn.addEventListener('click', () => {
    if (state.timer) stopPlayback();
    else startPlayback();
  });

  els.startBtn.addEventListener('click', () => {
    stopPlayback();
    setIndex(0);
  });

  els.prevBtn.addEventListener('click', () => {
    stopPlayback();
    setIndex(state.index - 1);
  });

  els.nextBtn.addEventListener('click', () => {
    stopPlayback();
    setIndex(state.index + 1);
  });

  els.endBtn.addEventListener('click', () => {
    stopPlayback();
    setIndex(state.monthMarks.length - 1);
  });

  els.slider.addEventListener('input', (event) => {
    stopPlayback();
    setIndex(Number(event.target.value));
  });

  els.speedSelect.addEventListener('change', () => {
    if (state.timer) startPlayback();
  });

  [els.programmeFilter, els.contentTypeFilter, els.themeFilter].forEach((filter) => {
    filter?.addEventListener('change', () => {
      stopPlayback();
      applyTimelineFilters();
    });
  });

  els.resetFiltersBtn?.addEventListener('click', () => {
    stopPlayback();
    els.programmeFilter.value = 'all';
    els.contentTypeFilter.value = 'all';
    els.themeFilter.value = 'all';
    applyTimelineFilters();
  });

  els.monthPublications.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest('[data-record-id]');
    if (!item) return;

    const recordId = Number(item.getAttribute('data-record-id'));
    if (!Number.isFinite(recordId)) return;

    state.selectedRecordId = recordId;
    render();
  });

  if (els.monthDots) {
    els.monthDots.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const dot = target.closest('.tl-month-dot');
      if (!dot) return;

      const idx = Number(dot.getAttribute('data-index'));
      if (!Number.isFinite(idx)) return;

      stopPlayback();
      setIndex(idx);
    });

    els.monthDots.addEventListener('mouseover', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dot = target.closest('.tl-month-dot');
      if (!(dot instanceof HTMLElement)) return;
      showDotTooltip(dot, event);
    });

    els.monthDots.addEventListener('mousemove', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dot = target.closest('.tl-month-dot');
      if (!(dot instanceof HTMLElement)) return;
      moveDotTooltip(event.clientX, event.clientY);
    });

    els.monthDots.addEventListener('mouseout', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dot = target.closest('.tl-month-dot');
      if (!(dot instanceof HTMLElement)) return;
      hideDotTooltip();
    });
  }

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTypingContext = target instanceof HTMLElement
      && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (isTypingContext) return;

    if (event.key === ' ') {
      event.preventDefault();
      if (state.timer) stopPlayback();
      else startPlayback();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stopPlayback();
      setIndex(state.index - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stopPlayback();
      setIndex(state.index + 1);
    }
  });
}

async function init() {
  bindEvents();
  applyStateFromUrl();

  const [dataResponse, themeResponse] = await Promise.all([
    fetch(DATA_URL, { cache: 'no-store' }),
    fetch(THEME_DATA_URL, { cache: 'no-store' })
  ]);
  if (!dataResponse.ok) throw new Error('Failed to load all_programs.json');

  const rows = await dataResponse.json();
  if (themeResponse.ok) {
    const themePayload = await themeResponse.json();
    state.themeMeta = themePayload.theme_meta || {};
  }

  state.allRecords = rows
    .map((r, idx) => ({
      id: idx + 1,
      date: parseDate(r),
      title: String(r.Title || ''),
      url: String(r.Url || r.url || '').trim(),
      doi: String(r.DOI || r.doi || '').trim(),
      summary: String(r['Abstract Note'] || r.abstract || '').trim(),
      programme: String(r.program || 'Unknown Programme'),
      contentType: normalizeContentType(r),
      itemType: String(r['Item Type'] || '').trim(),
      author: String(r.Author || '').trim(),
      countries: asArray(r.countries),
      themes: inferThemes(r)
    }))
    .filter((r) => r.date && r.date >= START_DATE)
    .filter((r) => {
      if (!state.queryFilter) return true;
      const haystack = `${r.title} ${r.programme} ${r.contentType} ${r.summary}`.toLowerCase();
      return haystack.includes(state.queryFilter);
    })
    .sort((a, b) => a.date - b.date);

  state.records = [...state.allRecords];
  updateFilterOptions();
  const pendingSelections = [
    [els.programmeFilter, state.pendingFilters.programme],
    [els.contentTypeFilter, state.pendingFilters.contentType],
    [els.themeFilter, state.pendingFilters.theme]
  ];
  pendingSelections.forEach(([select, value]) => {
    if (select && [...select.options].some((option) => option.value === value)) select.value = value;
  });

  const now = new Date();
  const maxDate = state.records.length ? state.records[state.records.length - 1].date : now;
  state.monthMarks = buildMonthMarks(START_DATE, maxDate > now ? maxDate : now);
  state.records = state.allRecords.filter((record) => {
    if (els.programmeFilter.value !== 'all' && record.programme !== els.programmeFilter.value) return false;
    if (els.contentTypeFilter.value !== 'all' && record.contentType !== els.contentTypeFilter.value) return false;
    if (els.themeFilter.value !== 'all' && !record.themes.includes(els.themeFilter.value)) return false;
    return true;
  });
  buildMonthActivity();
  renderAxisTicks();
  renderMonthDots();

  if (els.heroOutputs) {
    els.heroOutputs.textContent = `Outputs: ${state.records.length}`;
  }
  if (els.filterStatus) {
    const activeCount = [els.programmeFilter.value, els.contentTypeFilter.value, els.themeFilter.value]
      .filter((value) => value !== 'all').length;
    els.filterStatus.textContent = activeCount
      ? `${state.records.length} matching output${state.records.length === 1 ? '' : 's'} · ${activeCount} active filter${activeCount === 1 ? '' : 's'}`
      : `Showing all ${state.records.length} outputs`;
  }
  if (els.heroRange && state.monthMarks.length) {
    els.heroRange.textContent = `Range: ${formatMonth(state.monthMarks[0])} → ${formatMonth(state.monthMarks[state.monthMarks.length - 1])}`;
  }

  if (els.rangeEnd && state.monthMarks.length) {
    els.rangeEnd.textContent = formatMonth(state.monthMarks[state.monthMarks.length - 1]);
  }

  els.slider.max = String(Math.max(0, state.monthMarks.length - 1));

  let initialIndex = state.monthMarks.length - 1;
  if (state.pendingMonthFromUrl) {
    const byMonth = state.monthMarks.findIndex((d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` === state.pendingMonthFromUrl);
    if (byMonth >= 0) {
      initialIndex = byMonth;
    }
  } else if (state.pendingYearFromUrl !== null) {
    const indicesInYear = state.monthMarks
      .map((d, idx) => ({ d, idx }))
      .filter(({ d }) => d.getUTCFullYear() === state.pendingYearFromUrl)
      .map(({ idx }) => idx);
    if (indicesInYear.length) {
      initialIndex = indicesInYear[indicesInYear.length - 1];
    }
  }

  setIndex(initialIndex);
}

init().catch((error) => {
  console.error(error);
  els.milestones.innerHTML = '<li>Could not load timeline data.</li>';
});
