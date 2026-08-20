<main class="main-content-wrapper ta-page">
  <section class="py-5 mapping-page">
    <div class="container-fluid mapping-fullwidth-wrap">
      <header class="ta-hero">
        <div class="ta-hero-copy">
          <p class="ta-kicker">APRI Thematic Intelligence</p>
          <h1>Theme Relationships Timeline</h1>
          <p class="ta-sub">Explore how APRI themes and their tags evolve and overlap over time. Bubble size reflects mention frequency per year.</p>
          <div class="ta-hero-meta">
            <span id="taYearRangeChip" class="ta-meta-chip">Years: —</span>
            <span id="taThemeCountChip" class="ta-meta-chip">Visible tags: 0</span>
          </div>
        </div>
        <div class="mapping-view-switcher" role="navigation" aria-label="Mapping views">
          <a id="taLinkDashboard" class="mapping-view-pill" href="?view=dashboard">Dashboard</a>
          <a class="mapping-view-pill is-active" href="?view=themes">Themes</a>
          <a id="taLinkTimeline" class="mapping-view-pill" href="?view=timeline">Timeline</a>
        </div>
      </header>

      <section class="ta-controls">
        <button id="playPauseBtn" class="ta-btn ta-btn-primary" type="button">Play</button>
        <button id="prevYearBtn" class="ta-btn" type="button" aria-label="Previous year">←</button>
        <button id="nextYearBtn" class="ta-btn" type="button" aria-label="Next year">→</button>

        <div class="ta-year-wrap">
          <label for="yearSlider">Year</label>
          <input id="yearSlider" type="range" min="0" max="0" step="1" value="0" />
          <span id="yearLabel">—</span>
        </div>

        <label class="ta-speed-wrap">Speed
          <select id="speedSelect">
            <option value="1600">Slow</option>
            <option value="1100" selected>Normal</option>
            <option value="700">Fast</option>
          </select>
        </label>

        <label class="ta-filter-wrap">Search theme
          <input id="themeSearchInput" type="search" placeholder="e.g. transition, gas, refining" />
        </label>

        <label class="ta-filter-wrap">Min mentions
          <input id="minMentionsInput" type="range" min="1" max="30" step="1" value="1" />
          <span id="minMentionsLabel">1+</span>
        </label>

        <label class="ta-filter-wrap">Theme
          <select id="clusterFilterSelect">
            <option value="all">All themes</option>
          </select>
        </label>

        <label class="ta-filter-wrap">Programme
          <select id="programFilterSelect">
            <option value="all">All programmes</option>
          </select>
        </label>

        <button id="resetFiltersBtn" class="ta-btn" type="button">Reset filters</button>
      </section>

      <div class="ta-grid">
        <section class="ta-chart-card">
          <div class="ta-map-guide">
            <div class="ta-map-guide-summary" tabindex="0">How to read this map</div>
            <div class="ta-map-guide-panel">
              <div class="ta-map-guide-item">
                <span class="ta-guide-symbol ta-guide-anchor" aria-hidden="true">12</span>
                <span><strong>Theme anchor</strong> — one of the 12 controlled themes; the number shows mentions.</span>
              </div>
              <div class="ta-map-guide-item">
                <span class="ta-guide-symbol ta-guide-bubble" aria-hidden="true"></span>
                <span><strong>Tag bubble</strong> — size reflects how often the tag is mentioned.</span>
              </div>
              <div class="ta-map-guide-item">
                <span class="ta-guide-symbol ta-guide-ring" aria-hidden="true"></span>
                <span><strong>Outer ring</strong> — color identifies the leading APRI programme.</span>
              </div>
              <div class="ta-map-guide-item">
                <span class="ta-guide-symbol ta-guide-overlap" aria-hidden="true"></span>
                <span><strong>Overlap</strong> — a solid line marks the primary theme; dashed lines mark related themes.</span>
              </div>
              <p class="ta-map-guide-actions"><strong>Explore:</strong> Hover over a tag or theme to preview its connections. Click once to select it and keep its overlaps visible; click it again to clear the selection.</p>
              <p class="ta-map-guide-actions"><strong>Move around:</strong> Drag the canvas to pan. Use the mouse wheel, trackpad pinch, or <strong>+</strong> and <strong>−</strong> controls to zoom. Select <strong>↺</strong> to restore the full map.</p>
              <p class="ta-map-guide-actions"><strong>Inspect:</strong> The side panel shows details for the selected tag or theme. Filters and the year control update what appears on the map.</p>
              <p class="ta-map-guide-actions"><strong>Save:</strong> Select <strong>Export Map PNG</strong> to download the current map as an image.</p>
            </div>
          </div>
          <div class="ta-zoom-controls" aria-label="Map zoom controls">
            <button id="taZoomInBtn" type="button" aria-label="Zoom in" title="Zoom in">+</button>
            <button id="taZoomOutBtn" type="button" aria-label="Zoom out" title="Zoom out">−</button>
            <button id="taResetZoomBtn" type="button" aria-label="Reset map view" title="Reset map view">↺</button>
          </div>
          <div class="ta-map-export">
            <button id="taExportMapPngBtn" class="ta-btn" type="button">Export Map PNG</button>
          </div>
          <svg id="clusterSvg" aria-label="Theme cluster animation"></svg>
          <div id="clusterTooltip" class="ta-tooltip hidden" role="tooltip"></div>
          <div id="emptyState" class="ta-empty hidden">No theme tags found for this year.</div>
          <div id="taProgramLegend" class="ta-program-legend" aria-label="Programme ring legend"></div>
        </section>

        <aside class="ta-side-card">
          <h2 id="taSelectionHeading">Selected Tag</h2>
          <article id="selectedThemeCard" class="ta-selected-theme">
            <div class="ta-selected-heading">
              <span id="taSelectedBadge" class="ta-selected-badge" hidden>Selected</span>
              <button id="taClearSelectionBtn" class="ta-clear-selection" type="button" hidden>Clear selection</button>
            </div>
            <h3 id="selectedThemeTitle">No tag selected</h3>
            <p id="selectedThemeMeta" class="ta-selected-meta">Click a bubble to inspect details.</p>
            <ul id="selectedThemeRelated" class="ta-cluster-list"></ul>
          </article>

          <h2>Theme Summary</h2>
          <ul id="clusterList" class="ta-cluster-list"></ul>

          <h2 class="mt-3">Top Tags</h2>
          <ol id="topThemesList" class="ta-top-themes"></ol>
        </aside>
      </div>

    </div>
  </section>
</main>
