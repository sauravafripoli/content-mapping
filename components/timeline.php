<main class="main-content-wrapper tl-page-wrap">
  <section class="py-5 mapping-page">
    <div class="container-fluid mapping-fullwidth-wrap">
      <header class="tl-hero">
        <div>
          <p class="tl-kicker">APRI History</p>
          <h1>APRI Timeline (2021 → Today)</h1>
          <p class="tl-sub">Move through time to see APRI outputs by month, with concrete milestones based on publication dates.</p>
          <div class="tl-hero-meta">
            <span id="tlHeroOutputs" class="tl-meta-chip">Outputs: 0</span>
            <span id="tlHeroRange" class="tl-meta-chip">Range: —</span>
          </div>
        </div>
        <div class="mapping-view-switcher" role="navigation" aria-label="Mapping views">
          <a id="tlLinkDashboard" class="mapping-view-pill" href="?view=dashboard">Dashboard</a>
          <a id="tlLinkThemes" class="mapping-view-pill" href="?view=themes">Themes</a>
          <a class="mapping-view-pill is-active" href="?view=timeline">Timeline</a>
        </div>
      </header>

      <section class="tl-progress-card">
        <div class="tl-controls">
          <div class="tl-controls-group tl-controls-main">
            <button id="tlPlayPauseBtn" class="tl-btn tl-btn-primary" type="button">Play</button>
            <button id="tlStartBtn" class="tl-btn" type="button" aria-label="Jump to start">Start</button>
            <button id="tlPrevBtn" class="tl-btn" type="button" aria-label="Previous month">←</button>
            <button id="tlNextBtn" class="tl-btn" type="button" aria-label="Next month">→</button>
            <button id="tlEndBtn" class="tl-btn" type="button" aria-label="Jump to latest">Latest</button>
          </div>

          <div class="tl-slider-wrap">
            <label for="tlSlider">Timeline</label>
            <input id="tlSlider" type="range" min="0" max="0" step="1" value="0" />
          </div>

          <div class="tl-controls-group tl-controls-meta">
            <span id="tlCurrentDateBadge" class="tl-current-date">—</span>

            <label class="tl-speed-wrap">Speed
              <select id="tlSpeedSelect">
                <option value="1700">Slow</option>
                <option value="1100" selected>Normal</option>
                <option value="650">Fast</option>
              </select>
            </label>
          </div>
        </div>

        <div class="tl-progress-head">
          <span class="tl-range-edge">Jan 2021</span>
          <span class="tl-inline-date">Monthly activity</span>
          <span id="tlRangeEnd" class="tl-range-edge">Today</span>
        </div>

        <div id="tlMonthDots" class="tl-month-dots" aria-label="Timeline monthly activity"></div>
        <div id="tlDotTooltip" class="tl-dot-tooltip" role="tooltip" aria-hidden="true"></div>
        <div id="tlTimelineAxis" class="tl-axis" aria-hidden="true">
          <div id="tlAxisTicks" class="tl-axis-ticks"></div>
          <div id="tlAxisMarker" class="tl-axis-marker"></div>
        </div>
      </section>

      <div class="tl-grid">
        <section class="tl-panel">
          <h2>What APRI had done by this date</h2>
          <div class="tl-stats">
            <div class="tl-stat">
              <div class="label">Total outputs</div>
              <div id="tlTotalCount" class="value">0</div>
            </div>
            <div class="tl-stat">
              <div class="label">This month</div>
              <div id="tlMonthCount" class="value">0</div>
            </div>
            <div class="tl-stat">
              <div class="label">Programmes active</div>
              <div id="tlProgrammeCount" class="value">0</div>
            </div>
          </div>

          <section class="tl-block" aria-live="polite">
            <h3 class="tl-block-title" id="tlMonthHeadline">Month spotlight</h3>
            <p id="tlMonthSub" class="tl-month-sub">No publications in this month.</p>
            <div id="tlMonthTypeChips" class="tl-chip-row"></div>
          </section>

          <section class="tl-block">
            <h3 class="tl-block-title">Publications in this month</h3>
            <ul id="tlMonthPublications" class="tl-list tl-publication-list"></ul>
          </section>

          <section class="tl-block">
            <h3 class="tl-block-title">Latest milestones</h3>
            <ul id="tlMilestones" class="tl-list"></ul>
          </section>
        </section>

        <section class="tl-panel">
          <section class="tl-block">
            <h2 class="tl-block-h2">Selected Publication</h2>
            <article id="tlSelectedPublication" class="tl-selected-pub">
              <h3 id="tlSelectedTitle">No publication selected</h3>
              <p id="tlSelectedMeta" class="tl-selected-meta">Pick any publication from the list.</p>
              <p id="tlSelectedSummary" class="tl-selected-summary"></p>
              <div id="tlSelectedActions" class="tl-selected-actions"></div>
            </article>
          </section>

          <section class="tl-block">
            <h2 class="tl-block-h2">Cumulative by Content Type</h2>
            <ul id="tlTypeList" class="tl-list"></ul>
          </section>
        </section>
      </div>
    </div>
  </section>
</main>
