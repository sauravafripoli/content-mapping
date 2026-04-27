<main class="main-content-wrapper ta-page">
  <section class="py-5 mapping-page">
    <div class="container-fluid mapping-fullwidth-wrap">
      <header class="ta-hero">
        <div class="ta-hero-copy">
          <p class="ta-kicker">APRI Thematic Intelligence</p>
          <h1>Theme Clusters Timeline</h1>
          <p class="ta-sub">Explore how APRI thematic focus evolves over time using tag co-occurrence clusters. Bubble size reflects mention frequency per year.</p>
          <div class="ta-hero-meta">
            <span id="taYearRangeChip" class="ta-meta-chip">Years: —</span>
            <span id="taThemeCountChip" class="ta-meta-chip">Visible themes: 0</span>
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

        <label class="ta-filter-wrap">Cluster
          <select id="clusterFilterSelect">
            <option value="all">All clusters</option>
          </select>
        </label>

        <button id="resetFiltersBtn" class="ta-btn" type="button">Reset filters</button>
      </section>

      <div class="ta-grid">
        <section class="ta-chart-card">
          <svg id="clusterSvg" aria-label="Theme cluster animation"></svg>
          <div id="clusterTooltip" class="ta-tooltip hidden" role="tooltip"></div>
          <div id="emptyState" class="ta-empty hidden">No theme tags found for this year.</div>
          <div id="taProgramLegend" class="ta-program-legend" aria-label="Programme ring legend"></div>
          <article class="ta-story-inline" aria-live="polite">
            <div class="ta-story-inline-header">
              <div>
                <h2>Cluster Narrative</h2>
                <p id="taStoryHeadline" class="ta-story-headline">Select a year or play the animation to see the cluster story.</p>
              </div>
              <button id="taStoryModeBtn" class="ta-btn" type="button">Story mode</button>
            </div>
            <p id="taStoryBody" class="ta-story-body"></p>
            <div id="taStoryMeta" class="ta-story-meta-row"></div>
          </article>
        </section>

        <aside class="ta-side-card">
          <h2>Selected Theme</h2>
          <article id="selectedThemeCard" class="ta-selected-theme">
            <h3 id="selectedThemeTitle">No theme selected</h3>
            <p id="selectedThemeMeta" class="ta-selected-meta">Click a bubble to inspect details.</p>
            <ul id="selectedThemeRelated" class="ta-cluster-list"></ul>
          </article>

          <h2>Cluster Summary</h2>
          <ul id="clusterList" class="ta-cluster-list"></ul>

          <h2 class="mt-3">Top Themes</h2>
          <ol id="topThemesList" class="ta-top-themes"></ol>
        </aside>
      </div>

      <section class="ta-insights">
        <div class="ta-kpi-grid">
          <article class="ta-kpi-card">
            <div class="ta-kpi-label">Mentions (current year)</div>
            <div id="taKpiMentions" class="ta-kpi-value">0</div>
          </article>
          <article class="ta-kpi-card">
            <div class="ta-kpi-label">Year-on-year momentum</div>
            <div id="taKpiGrowth" class="ta-kpi-value">—</div>
          </article>
          <article class="ta-kpi-card">
            <div class="ta-kpi-label">Active clusters</div>
            <div id="taKpiClusters" class="ta-kpi-value">0</div>
          </article>
          <article class="ta-kpi-card">
            <div class="ta-kpi-label">Theme concentration index</div>
            <div id="taKpiDiversity" class="ta-kpi-value">—</div>
          </article>
        </div>

        <div class="ta-export-row">
          <button id="taExportImpactPngBtn" class="ta-btn" type="button">Export Impact PNG</button>
          <button id="taExportTrendPngBtn" class="ta-btn" type="button">Export Trend PNG</button>
          <button id="taExportCsvBtn" class="ta-btn" type="button">Export CSV</button>
        </div>

        <div class="ta-insights-grid">
          <article class="ta-insight-card ta-insight-card--impact">
            <h2>Impact by Cluster (current year)</h2>
            <svg id="taImpactBars" class="ta-mini-chart" aria-label="Impact by cluster"></svg>
          </article>

          <article class="ta-insight-card">
            <h2>Mentions Trend Across Years</h2>
            <svg id="taTrendSvg" class="ta-mini-chart" aria-label="Mentions trend by year"></svg>
            <h3 class="mt-2">Top Rising Themes</h3>
            <ul id="taRisingList" class="ta-cluster-list"></ul>
          </article>
        </div>
      </section>
    </div>
  </section>
</main>
