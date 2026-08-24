const DATA_URL = new URL('../../data/all_programs.json', import.meta.url).href;
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const GROUP_EXPANSIONS = {
    EU: [
        'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia',
        'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia',
        'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania',
        'Slovakia', 'Slovenia', 'Spain', 'Sweden'
    ],
    ECOWAS: [
        'Benin', 'Burkina Faso', 'Cabo Verde', "Côte d'Ivoire", 'The Gambia', 'Ghana', 'Guinea',
        'Guinea-Bissau', 'Liberia', 'Mali', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'
    ],
    BRICS: [
        'Brazil', 'Russia', 'India', 'China', 'South Africa', 'Egypt', 'Ethiopia', 'Iran', 'Saudi Arabia', 'United Arab Emirates'
    ],
    'West Africa': [
        'Benin', 'Burkina Faso', 'Cabo Verde', "Côte d'Ivoire", 'The Gambia', 'Ghana', 'Guinea',
        'Guinea-Bissau', 'Liberia', 'Mali', 'Mauritania', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'
    ]
};

const COUNTRY_ALIASES = {
    'united states': ['United States of America', 'United States', 'USA', 'US', 'U.S.A.', 'U.S.'],
    'united states of america': ['United States', 'USA', 'US', 'U.S.A.', 'U.S.'],
    'usa': ['United States of America', 'United States', 'US'],
    'drc': ['Democratic Republic of the Congo', 'Congo, The Democratic Republic of the'],
    'democratic republic of the congo': ['DRC', 'Congo, The Democratic Republic of the', 'COD'],
    'south africa': ['South Africa'],
    'cote d\'ivoire': ["Côte d'Ivoire", "Cote d'Ivoire"],
    'cabo verde': ['Cape Verde', 'Cabo Verde'],
    'the gambia': ['Gambia', 'The Gambia'],
    'turkey': ['Türkiye', 'Turkey', 'TUR'],
    'turkiye': ['Türkiye', 'Turkey', 'TUR']
};

// CRM-style manual view tuning for countries that can behave oddly in world projections.
const COUNTRY_VIEW_OVERRIDES = {
    'united states of america': { center: [-98, 39], scale: 4.2 },
    'united states': { center: [-98, 39], scale: 4.2 },
    'russia': { center: [95, 61], scale: 2.8 },
    'france': { center: [2.3, 46.2], scale: 5.0 }
};

const CONTENT_TYPE_LOOKUP = {
    publication: 'Publication',
    publications: 'Publication',
    mapping: 'Mapping',
    mappings: 'Mapping',
    event: 'Event',
    events: 'Event',
    podcast: 'Podcast',
    podcasts: 'Podcast',
    'short analysis': 'Short Analysis',
    'short analyses': 'Short Analysis',
    analysis: 'Short Analysis'
};

const state = {
    records: [],
    baseFiltered: [],
    filtered: [],
    worldFeatures: [],
    countryMetrics: new Map(),
    maxCountryCount: 0,
    mapInitialized: false,
    selectedCountryNormalized: null,
    selectedCountryLabel: null,
    mapProjection: null,
    mapPath: null,
    mapSvg: null,
    mapStage: null,
    countryLayer: null,
    labelLayer: null,
    zoomBehavior: null,
    zoomTransform: d3.zoomIdentity,
    mapWidth: 0,
    mapHeight: 0,
    pageSize: 10,
    currentPage: 1
};

const els = {};

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function setLinkHref(baseView, params = {}) {
    const search = new URLSearchParams({ view: baseView });
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== '' && String(value) !== 'all') {
            search.set(key, String(value));
        }
    });
    return `?${search.toString()}`;
}

function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function parseYear(record) {
    const year = (record['Publication Year'] || '').trim();
    return year || 'Unknown';
}

function asArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (!value) {
        return [];
    }
    return String(value)
        .split(';')
        .map((v) => v.trim())
        .filter(Boolean);
}

function normalizeRecord(row) {
    return {
        key: row.Key || crypto.randomUUID(),
        title: (row.Title || '').trim(),
        author: (row.Author || '').trim(),
        year: parseYear(row),
        itemType: (row['Item Type'] || '').trim(),
        contentType: resolveContentType(row),
        program: (row.program || '').trim(),
        url: (row.Url || '').trim(),
        manualTags: asArray(row['Manual Tags']),
        countries: asArray(row.countries),
        raw: row
    };
}

function resolveContentType(row) {
    const rawValue = (
        row['Content Type']
        || row.contentType
        || row.content_type
        || row.Category
        || row.category
        || ''
    )
        .toString()
        .trim();

    if (!rawValue) {
        return 'Publication';
    }

    const normalized = rawValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return CONTENT_TYPE_LOOKUP[normalized] || rawValue;
}

function populateSelect(selectEl, values, allLabel) {
    const current = selectEl.value || 'all';
    selectEl.innerHTML = '';

    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = allLabel;
    selectEl.appendChild(allOpt);

    values.forEach((value) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        selectEl.appendChild(opt);
    });

    selectEl.value = values.includes(current) || current === 'all' ? current : 'all';
}

function updateFilterOptions() {
    const records = state.records;

    populateSelect(
        els.programFilter,
        uniqueSorted(records.map((r) => r.program)),
        'All Programmes'
    );

    populateSelect(
        els.contentTypeFilter,
        uniqueSorted(records.map((r) => r.contentType)),
        'All Content Types'
    );

    populateSelect(
        els.yearFilter,
        uniqueSorted(records.map((r) => r.year)).sort((a, b) => b.localeCompare(a)),
        'All Years'
    );

    populateSelect(
        els.typeFilter,
        uniqueSorted(records.map((r) => r.itemType)),
        'All Types'
    );
}

function applyFilters(options = {}) {
    const { resetPage = false } = options;
    const program = els.programFilter.value;
    const contentType = els.contentTypeFilter.value;
    const year = els.yearFilter.value;
    const type = els.typeFilter.value;
    const search = els.searchInput.value.trim().toLowerCase();

    state.baseFiltered = state.records.filter((record) => {
        if (program !== 'all' && record.program !== program) return false;
        if (contentType !== 'all' && record.contentType !== contentType) return false;
        if (year !== 'all' && record.year !== year) return false;
        if (type !== 'all' && record.itemType !== type) return false;

        if (search) {
            const haystack = [
                record.title,
                record.author,
                record.contentType,
                record.program,
                record.itemType,
                ...record.manualTags,
                ...record.countries
            ]
                .join(' ')
                .toLowerCase();

            if (!haystack.includes(search)) return false;
        }

        return true;
    });

    state.filtered = state.baseFiltered.filter((record) => recordMatchesSelectedCountry(record));
    buildCountryMetrics();

    if (resetPage) {
        state.currentPage = 1;
    }

    updateSelectedCountryStatus();
    renderActiveFilters();

    renderTable();
    renderCountrySummary();
    updateMapHighlights();
    updateCrossViewLinks();
}

function renderActiveFilters() {
    if (!els.activeFilters) return;

    const filters = [
        ['program', 'Programme', els.programFilter.value],
        ['contentType', 'Content type', els.contentTypeFilter.value],
        ['year', 'Year', els.yearFilter.value],
        ['type', 'Item type', els.typeFilter.value],
        ['q', 'Search', els.searchInput.value.trim()],
        ['country', 'Country', state.selectedCountryLabel || '']
    ].filter(([, , value]) => value && value !== 'all');

    if (!filters.length) {
        els.activeFilters.innerHTML = '';
        els.activeFilters.classList.add('d-none');
        return;
    }

    els.activeFilters.classList.remove('d-none');
    els.activeFilters.innerHTML = `
        <span class="mapping-active-filters-label">Active filters</span>
        ${filters.map(([key, label, value]) => `
            <button type="button" class="mapping-active-filter" data-filter-key="${key}" title="Remove ${escapeHtml(label)} filter">
                <span>${escapeHtml(label)}: <strong>${escapeHtml(value)}</strong></span>
                <span aria-hidden="true">×</span>
            </button>
        `).join('')}
        <button type="button" class="mapping-clear-filters" data-filter-key="all">Clear all</button>
    `;
}

function applyFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const program = params.get('program');
    const contentType = params.get('contentType');
    const year = params.get('year');
    const type = params.get('type');
    const q = params.get('q');

    if (program && [...els.programFilter.options].some((o) => o.value === program)) {
        els.programFilter.value = program;
    }
    if (contentType && [...els.contentTypeFilter.options].some((o) => o.value === contentType)) {
        els.contentTypeFilter.value = contentType;
    }
    if (year && [...els.yearFilter.options].some((o) => o.value === year)) {
        els.yearFilter.value = year;
    }
    if (type && [...els.typeFilter.options].some((o) => o.value === type)) {
        els.typeFilter.value = type;
    }
    if (q) {
        els.searchInput.value = q;
    }
}

function updateCrossViewLinks() {
    const params = {
        year: els.yearFilter.value,
        q: els.searchInput.value.trim(),
        program: els.programFilter.value,
        contentType: els.contentTypeFilter.value,
        type: els.typeFilter.value
    };

    if (els.linkThemes) {
        els.linkThemes.href = setLinkHref('themes', params);
    }
    if (els.linkTimeline) {
        els.linkTimeline.href = setLinkHref('timeline', params);
    }
}

function renderTable() {
    const rows = state.filtered;
    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / state.pageSize));

    if (state.currentPage > totalPages) {
        state.currentPage = totalPages;
    }

    const start = (state.currentPage - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    els.resultsCount.textContent = `${totalRows} item${totalRows === 1 ? '' : 's'}`;

    if (!totalRows) {
        els.tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-muted py-4 text-center">No records found for current filters.</td>
            </tr>
        `;
        els.pagination.innerHTML = '';
        els.emptyState.classList.remove('d-none');
        return;
    }

    els.emptyState.classList.add('d-none');
    els.tableBody.innerHTML = pageRows
        .map((row) => {
            const safeTitle = row.title || 'Untitled';
            const linkedTitle = row.url
                ? `<a href="${row.url}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>`
                : safeTitle;

            return `
                <tr>
                    <td>${row.year || '-'}</td>
                    <td>${row.author || '-'}</td>
                    <td class="mapping-row-title">${linkedTitle}</td>
                    <td>${row.program || '-'}</td>
                    <td>${row.itemType || '-'}</td>
                </tr>
            `;
        })
        .join('');

    renderPagination(totalRows, totalPages);
}

function renderPagination(totalRows, totalPages) {
    if (totalRows <= state.pageSize) {
        els.pagination.innerHTML = '';
        return;
    }

    const pageButtons = [];
    for (let i = 1; i <= totalPages; i += 1) {
        pageButtons.push(`
            <button type="button" class="mapping-page-btn ${i === state.currentPage ? 'is-active' : ''}" data-page="${i}" aria-label="Page ${i}" ${i === state.currentPage ? 'aria-current="page"' : ''}>${i}</button>
        `);
    }

    els.pagination.innerHTML = `
        <button type="button" class="mapping-page-btn" data-page="prev" ${state.currentPage === 1 ? 'disabled' : ''}>Prev</button>
        ${pageButtons.join('')}
        <button type="button" class="mapping-page-btn" data-page="next" ${state.currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

function expandCountryEntity(entity) {
    if (GROUP_EXPANSIONS[entity]) {
        return GROUP_EXPANSIONS[entity];
    }
    return [entity];
}

function getCountrySet(records) {
    const countries = new Set();

    records.forEach((record) => {
        record.countries.forEach((entity) => {
            expandCountryEntity(entity).forEach((country) => {
                if (country && country.trim()) {
                    countries.add(country.trim());
                }
            });
        });
    });

    return countries;
}

function buildCountryMetrics() {
    const metrics = new Map();

    state.baseFiltered.forEach((record) => {
        const countriesInRecord = new Map();
        record.countries.forEach((entity) => {
            expandCountryEntity(entity).forEach((country) => {
                const label = String(country || '').trim();
                const normalized = normalizeName(label);
                if (normalized) countriesInRecord.set(normalized, label);
            });
        });

        countriesInRecord.forEach((label, normalized) => {
            const metric = metrics.get(normalized) || {
                name: label,
                normalized,
                count: 0,
                programmes: new Map()
            };
            metric.count += 1;
            const programme = record.program || 'Unknown Programme';
            metric.programmes.set(programme, (metric.programmes.get(programme) || 0) + 1);
            metrics.set(normalized, metric);
        });
    });

    state.countryMetrics = metrics;
    state.maxCountryCount = Math.max(0, ...[...metrics.values()].map((metric) => metric.count));
}

function getCountryMetricForFeature(feature) {
    const properties = feature?.properties || {};
    const identifiers = new Set(
        [
            featureName(feature),
            properties.ADMIN,
            properties.name,
            properties.NAME,
            properties.NAME_EN,
            properties.FORMAL_EN,
            properties.ISO_A2,
            properties.ISO_A3,
            properties.ADM0_A3
        ]
            .map((value) => normalizeName(String(value || '')))
            .filter(Boolean)
    );

    for (const metric of state.countryMetrics.values()) {
        if ([...identifiers].some((identifier) => isCountryNameMatchingFeature(metric.name, identifier))) {
            return metric;
        }
    }
    return null;
}

function countryIntensityColor(count) {
    if (!count || !state.maxCountryCount) return '#e5e7eb';
    const strength = Math.sqrt(count / state.maxCountryCount);
    return d3.interpolateRgb('#fde9ad', '#d97706')(0.2 + (strength * 0.8));
}

function renderCountrySummary() {
    const countryList = [...state.countryMetrics.values()]
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    els.countriesCount.textContent = `${countryList.length} countr${countryList.length === 1 ? 'y' : 'ies'} highlighted`;

    if (!countryList.length) {
        els.countryChips.innerHTML = '<span class="text-muted small">No country data in current filter.</span>';
        return;
    }

    els.countryChips.innerHTML = countryList
        .slice(0, 24)
        .map((metric) => {
            const isActive = state.selectedCountryNormalized
                && isCountryNameMatchingFeature(metric.name, state.selectedCountryNormalized);
            return `<button type="button" class="mapping-chip mapping-country-chip${isActive ? ' is-active' : ''}" data-country="${escapeHtml(metric.name)}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(metric.name)} <span>${metric.count}</span></button>`;
        })
        .join('');

    if (countryList.length > 24) {
        els.countryChips.innerHTML += `<span class="mapping-chip mapping-chip-more">+${countryList.length - 24} more</span>`;
    }
}

function normalizeName(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildHighlightLookup() {
    const set = getCountrySet(state.filtered);
    const lookup = new Set();

    [...set].forEach((country) => {
        const normalized = normalizeName(country);
        lookup.add(normalized);

        const aliases = COUNTRY_ALIASES[normalized] || [];
        aliases.forEach((alias) => lookup.add(normalizeName(alias)));
    });

    return lookup;
}

function featureName(feature) {
    const p = feature.properties || {};
    return p.ADMIN || p.name || p.NAME || p.country || '';
}

function isCountryNameMatchingFeature(countryName, featureNorm) {
    const countryNorm = normalizeName(countryName);
    if (!countryNorm || !featureNorm) {
        return false;
    }

    if (countryNorm === featureNorm) {
        return true;
    }

    const countryAliases = (COUNTRY_ALIASES[countryNorm] || []).map(normalizeName);
    if (countryAliases.includes(featureNorm)) {
        return true;
    }

    const featureAliases = (COUNTRY_ALIASES[featureNorm] || []).map(normalizeName);
    if (featureAliases.includes(countryNorm)) {
        return true;
    }

    for (const [key, aliases] of Object.entries(COUNTRY_ALIASES)) {
        const normalizedAliases = aliases.map(normalizeName);
        if (normalizedAliases.includes(featureNorm) && (countryNorm === key || normalizedAliases.includes(countryNorm))) {
            return true;
        }
        if (normalizedAliases.includes(countryNorm) && (featureNorm === key || normalizedAliases.includes(featureNorm))) {
            return true;
        }
    }

    return false;
}

function recordMatchesSelectedCountry(record) {
    if (!state.selectedCountryNormalized) {
        return true;
    }

    const expandedCountries = [];
    record.countries.forEach((entity) => {
        expandCountryEntity(entity).forEach((country) => expandedCountries.push(country));
    });

    return expandedCountries.some((country) =>
        isCountryNameMatchingFeature(country, state.selectedCountryNormalized)
    );
}

function updateSelectedCountryStatus() {
    if (!state.selectedCountryNormalized) {
        els.countryFilterStatus.textContent = 'No country selected';
        return;
    }

    const label = state.selectedCountryLabel || 'Selected country';
    const count = state.filtered.length;
    els.countryFilterStatus.textContent = `Selected: ${label} (${count} publication${count === 1 ? '' : 's'})`;
}

function getPrimaryGeometryFeature(feature) {
    const geometry = feature?.geometry;
    if (!geometry) {
        return feature;
    }

    if (geometry.type === 'Polygon') {
        return feature;
    }

    if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
        let biggestPolygon = null;
        let biggestArea = -1;

        geometry.coordinates.forEach((polygonCoords) => {
            const polygonFeature = {
                type: 'Feature',
                properties: feature.properties,
                geometry: {
                    type: 'Polygon',
                    coordinates: polygonCoords
                }
            };

            // Use spherical area to avoid projection distortion (e.g. Alaska appears oversized).
            const area = d3.geoArea(polygonFeature);
            if (area > biggestArea) {
                biggestArea = area;
                biggestPolygon = polygonFeature;
            }
        });

        return biggestPolygon || feature;
    }

    return feature;
}

function zoomByFactor(factor) {
    if (!state.mapSvg || !state.zoomBehavior) {
        return;
    }

    const currentScale = state.zoomTransform?.k || 1;
    const nextScale = Math.max(1, Math.min(8, currentScale * factor));
    const center = [state.mapWidth / 2, state.mapHeight / 2];

    state.mapSvg
        .transition()
        .duration(300)
        .call(state.zoomBehavior.scaleTo, nextScale, center);
}

function resetMapView() {
    if (!state.mapSvg || !state.zoomBehavior) {
        return;
    }

    const center = [state.mapWidth / 2, state.mapHeight / 2];

    state.mapSvg
        .transition()
        .duration(500)
        .call(state.zoomBehavior.scaleTo, 1, center);
}



function updateLabelVisibility() {
    if (!state.labelLayer) {
        return;
    }

    state.labelLayer
        .selectAll('text.mapping-map-country-label')
        .classed('is-visible', (feature) => {
            const name = normalizeName(featureName(feature));
            return Boolean(
                state.selectedCountryNormalized
                && isCountryNameMatchingFeature(state.selectedCountryLabel || state.selectedCountryNormalized, name)
            );
        });
}

function handleCountryClick(event, feature) {
    const featureNorm = normalizeName(featureName(feature));
    if (!featureNorm) {
        return;
    }

    const highlightLookup = buildHighlightLookup();
    const isHighlighted = highlightLookup.has(featureNorm);
    if (!isHighlighted) {
        return;
    }

    if (state.selectedCountryNormalized === featureNorm) {
        state.selectedCountryNormalized = null;
        state.selectedCountryLabel = null;
    } else {
        state.selectedCountryNormalized = featureNorm;
        state.selectedCountryLabel = featureName(feature);
    }

    applyFilters({ resetPage: true });
}

function showCountryTooltip(event, feature) {
    if (!els.mapTooltip) return;
    const metric = getCountryMetricForFeature(feature);
    const country = featureName(feature) || 'Unknown country';
    const topProgramme = metric
        ? [...metric.programmes.entries()].sort((a, b) => b[1] - a[1])[0]
        : null;

    els.mapTooltip.innerHTML = metric
        ? `<strong>${escapeHtml(country)}</strong><span>${metric.count} publication${metric.count === 1 ? '' : 's'}</span><span>Top programme: ${escapeHtml(topProgramme?.[0] || 'Not available')} (${topProgramme?.[1] || 0})</span><small>Click to filter</small>`
        : `<strong>${escapeHtml(country)}</strong><span>No publications in the current filters</span>`;
    els.mapTooltip.classList.add('is-visible');
    els.mapTooltip.setAttribute('aria-hidden', 'false');
    moveCountryTooltip(event);
}

function moveCountryTooltip(event) {
    if (!els.mapTooltip || !els.mapShell) return;
    const shellRect = els.mapShell.getBoundingClientRect();
    const tooltipWidth = els.mapTooltip.offsetWidth || 230;
    const tooltipHeight = els.mapTooltip.offsetHeight || 100;
    const left = Math.min(
        shellRect.width - tooltipWidth - 10,
        Math.max(10, event.clientX - shellRect.left + 14)
    );
    const top = Math.min(
        shellRect.height - tooltipHeight - 10,
        Math.max(10, event.clientY - shellRect.top + 14)
    );
    els.mapTooltip.style.left = `${left}px`;
    els.mapTooltip.style.top = `${top}px`;
}

function hideCountryTooltip() {
    if (!els.mapTooltip) return;
    els.mapTooltip.classList.remove('is-visible');
    els.mapTooltip.setAttribute('aria-hidden', 'true');
}

function initMap(features) {
    const container = els.worldMap;
    const { width, height } = container.getBoundingClientRect();
    const mapWidth = Math.max(720, width || 900);
    const mapHeight = Math.max(360, height || 460);

    container.innerHTML = '';
    const svg = d3
        .select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${mapWidth} ${mapHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const projection = d3.geoNaturalEarth1().fitSize([mapWidth, mapHeight], {
        type: 'FeatureCollection',
        features
    });

    const path = d3.geoPath(projection);

    const stage = svg.append('g').attr('class', 'map-stage');
    const countryLayer = stage.append('g').attr('class', 'country-layer');
    const labelLayer = stage.append('g').attr('class', 'label-layer');

    countryLayer
        .selectAll('path')
        .data(features)
        .join('path')
        .attr('class', 'mapping-map-country')
        .attr('d', path)
        .on('click', handleCountryClick)
        .on('mouseenter', showCountryTooltip)
        .on('mousemove', moveCountryTooltip)
        .on('mouseleave', hideCountryTooltip)
        .append('title')
        .text((d) => featureName(d));

    labelLayer
        .selectAll('text')
        .data(features)
        .join('text')
        .attr('class', 'mapping-map-country-label')
        .attr('x', (d) => path.centroid(d)[0])
        .attr('y', (d) => path.centroid(d)[1])
        .text((d) => featureName(d));

    state.mapProjection = projection;
    state.mapPath = path;
    state.mapSvg = svg;
    state.mapStage = stage;
    state.countryLayer = countryLayer;
    state.labelLayer = labelLayer;
    state.mapWidth = mapWidth;
    state.mapHeight = mapHeight;

    const zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 8])
        .filter((event) => {
            if (event.type === 'wheel') {
                return true;
            }

            const isPointerDragStart = event.type === 'mousedown' || event.type === 'touchstart';
            if (!isPointerDragStart) {
                return false;
            }

            return (state.zoomTransform?.k || 1) > 1.01;
        })
        .on('zoom', (event) => {
            const k = event.transform.k;
            let appliedTransform;

            // At base zoom, keep map centered and immovable.
            if (k <= 1.01) {
                state.zoomTransform = d3.zoomIdentity;
                appliedTransform = d3.zoomIdentity;
            } else {
                // When zoomed in, allow normal panning.
                state.zoomTransform = event.transform;
                appliedTransform = event.transform;
            }

            stage.attr('transform', appliedTransform);

            // Hide labels when zoomed-in to avoid oversized overlap.
            const hideLabelsForZoom = (appliedTransform.k || 1) > 1.15;
            labelLayer
                .selectAll('text.mapping-map-country-label')
                .classed('is-zoom-hidden', hideLabelsForZoom);
        });

    svg.call(zoomBehavior).on('dblclick.zoom', null);
    state.zoomBehavior = zoomBehavior;
    state.zoomTransform = d3.zoomIdentity;
    
    // Reset to initial view
    svg.call(zoomBehavior.transform, d3.zoomIdentity);

    state.mapInitialized = true;
}

function updateMapHighlights() {
    if (!state.mapInitialized || !state.worldFeatures.length) {
        return;
    }

    state.countryLayer
        .selectAll('path.mapping-map-country')
        .style('fill', (feature) => countryIntensityColor(getCountryMetricForFeature(feature)?.count || 0))
        .classed('is-highlighted', (feature) => {
            return Boolean(getCountryMetricForFeature(feature));
        })
        .classed('is-active', (feature) => {
            const name = normalizeName(featureName(feature));
            return Boolean(
                state.selectedCountryNormalized
                && isCountryNameMatchingFeature(state.selectedCountryLabel || state.selectedCountryNormalized, name)
            );
        });

    if (els.legendHigh) {
        const max = state.maxCountryCount;
        els.legendHigh.textContent = `${max} publication${max === 1 ? '' : 's'}`;
    }
    if (els.mapLegend) {
        els.mapLegend.classList.toggle('is-empty', state.maxCountryCount === 0);
    }

    updateLabelVisibility();
}

async function loadWorldMap() {
    try {
        const response = await fetch(WORLD_GEOJSON_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to fetch world geometry');

        const geojson = await response.json();
        const features = geojson.features || [];

        if (!features.length) throw new Error('World geometry is empty');

        state.worldFeatures = features;
        initMap(features);
        updateMapHighlights();
    } catch (error) {
        els.worldMap.innerHTML = '<div class="mapping-world-map-empty">World map could not be loaded.</div>';
        console.error(error);
    }
}

async function loadData() {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Unable to load all_programs.json');
    }

    const payload = await response.json();
    state.records = payload.map(normalizeRecord);
    state.filtered = [...state.records];
}

function bindEvents() {
    [els.programFilter, els.contentTypeFilter, els.yearFilter, els.typeFilter].forEach((el) => {
        el.addEventListener('change', () => applyFilters({ resetPage: true }));
    });

    els.searchInput.addEventListener('input', () => applyFilters({ resetPage: true }));

    els.countryChips.addEventListener('click', (event) => {
        const chip = event.target.closest('button[data-country]');
        if (!chip) return;
        const country = chip.dataset.country || '';
        const normalized = normalizeName(country);
        const isUnselecting = state.selectedCountryNormalized
            && isCountryNameMatchingFeature(country, state.selectedCountryNormalized);
        state.selectedCountryNormalized = isUnselecting ? null : normalized;
        state.selectedCountryLabel = isUnselecting ? null : country;
        applyFilters({ resetPage: true });
    });

    els.activeFilters.addEventListener('click', (event) => {
        const chip = event.target.closest('button[data-filter-key]');
        if (!chip) return;
        const key = chip.dataset.filterKey;

        if (key === 'all') {
            els.resetButton.click();
            return;
        }

        const selectByKey = {
            program: els.programFilter,
            contentType: els.contentTypeFilter,
            year: els.yearFilter,
            type: els.typeFilter
        };
        if (selectByKey[key]) selectByKey[key].value = 'all';
        if (key === 'q') els.searchInput.value = '';
        if (key === 'country') {
            state.selectedCountryNormalized = null;
            state.selectedCountryLabel = null;
        }
        applyFilters({ resetPage: true });
    });

    els.pagination.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-page]');
        if (!button) {
            return;
        }

        const action = button.dataset.page;
        const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));

        if (action === 'prev') {
            state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (action === 'next') {
            state.currentPage = Math.min(totalPages, state.currentPage + 1);
        } else {
            const page = Number.parseInt(action, 10);
            if (!Number.isNaN(page)) {
                state.currentPage = Math.min(totalPages, Math.max(1, page));
            }
        }

        renderTable();
    });

    els.resetButton.addEventListener('click', () => {
        els.programFilter.value = 'all';
        els.contentTypeFilter.value = 'all';
        els.yearFilter.value = 'all';
        els.typeFilter.value = 'all';
        els.searchInput.value = '';
        state.selectedCountryNormalized = null;
        state.selectedCountryLabel = null;
        updateFilterOptions();
        applyFilters({ resetPage: true });
    });

    els.resetMapButton.addEventListener('click', () => {
        state.selectedCountryNormalized = null;
        state.selectedCountryLabel = null;
        resetMapView();
        applyFilters({ resetPage: true });
    });

    els.zoomInButton.addEventListener('click', () => {
        zoomByFactor(1.25);
    });

    els.zoomOutButton.addEventListener('click', () => {
        zoomByFactor(0.8);
    });
    window.addEventListener('resize', () => {
        if (state.worldFeatures.length) {
            initMap(state.worldFeatures);
            updateMapHighlights();
        }
    });
}

function cacheElements() {
    els.programFilter = document.getElementById('mapping-programme-filter');
    els.contentTypeFilter = document.getElementById('mapping-content-type-filter');
    els.yearFilter = document.getElementById('mapping-year-filter');
    els.typeFilter = document.getElementById('mapping-type-filter');
    els.searchInput = document.getElementById('mapping-search');
    els.resetButton = document.getElementById('mapping-reset');
    els.tableBody = document.getElementById('mapping-table-body');
    els.resultsCount = document.getElementById('mapping-results-count');
    els.emptyState = document.getElementById('mapping-empty-state');
    els.worldMap = document.getElementById('mapping-world-map');
    els.mapShell = document.querySelector('.mapping-map-shell');
    els.mapTooltip = document.getElementById('mapping-map-tooltip');
    els.mapLegend = document.getElementById('mapping-map-legend');
    els.legendHigh = document.getElementById('mapping-legend-high');
    els.activeFilters = document.getElementById('mapping-active-filters');
    els.countryChips = document.getElementById('mapping-country-chips');
    els.countriesCount = document.getElementById('mapping-countries-count');
    els.resetMapButton = document.getElementById('mapping-reset-map');
    els.countryFilterStatus = document.getElementById('mapping-country-filter-status');
    els.zoomInButton = document.getElementById('mapping-zoom-in');
    els.zoomOutButton = document.getElementById('mapping-zoom-out');
    els.pagination = document.getElementById('mapping-pagination');
    els.linkThemes = document.getElementById('mapping-link-themes');
    els.linkTimeline = document.getElementById('mapping-link-timeline');
}

async function init() {
    cacheElements();
    bindEvents();

    try {
        await loadData();
        updateFilterOptions();
        applyFiltersFromUrl();
        applyFilters({ resetPage: true });
        await loadWorldMap();
    } catch (error) {
        console.error(error);
        els.tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-danger py-4 text-center">Failed to load publication data.</td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', init);
