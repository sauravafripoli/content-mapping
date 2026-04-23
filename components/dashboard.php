<main class="main-content-wrapper">
	<section class="py-5 mapping-page">
		<div class="container-fluid mapping-fullwidth-wrap">
			<div class="mapping-hero-card mb-4">
				<div class="mapping-hero-kicker">APRI Publication Intelligence</div>
				<h1 class="h2 mb-2">Content Mapping Dashboard</h1>
				<p class="mb-0">
					Filter by programme and content type, then explore country-level coverage across APRI content.
				</p>
				<div class="mapping-view-switcher mt-3" role="navigation" aria-label="Mapping views">
					<a href="?view=dashboard" class="mapping-view-pill is-active">Dashboard</a>
					<a id="mapping-link-themes" href="?view=themes" class="mapping-view-pill">Themes</a>
					<a id="mapping-link-timeline" href="?view=timeline" class="mapping-view-pill">Timeline</a>
				</div>
			</div>

			<div class="row g-4">
				<div class="col-lg-3 col-xl-2">
					<div class="card shadow-sm border-0 mapping-panel-card">
						<div class="card-body">
							<h2 class="h5 mb-3">Filters</h2>

							<div class="mb-3">
								<label for="mapping-programme-filter" class="form-label">Programme</label>
								<select id="mapping-programme-filter" class="form-select">
									<option value="all">All Programmes</option>
								</select>
							</div>

							<div class="mb-3">
								<label for="mapping-content-type-filter" class="form-label">Content Type</label>
								<select id="mapping-content-type-filter" class="form-select">
									<option value="all">All Content Types</option>
								</select>
							</div>

							<div class="mb-3">
								<label for="mapping-year-filter" class="form-label">Year</label>
								<select id="mapping-year-filter" class="form-select">
									<option value="all">All Years</option>
								</select>
							</div>

							<div class="mb-3">
								<label for="mapping-type-filter" class="form-label">Item Type</label>
								<select id="mapping-type-filter" class="form-select">
									<option value="all">All Types</option>
								</select>
							</div>

							<div class="mb-4">
								<label for="mapping-search" class="form-label">Search</label>
								<input
									id="mapping-search"
									class="form-control"
									type="search"
									placeholder="Title, author, keyword"
									autocomplete="off"
								>
							</div>

							<button type="button" id="mapping-reset" class="btn btn-outline-secondary w-100">
								Reset Filters
							</button>
						</div>
					</div>

					<div class="card shadow-sm border-0 mt-4 mapping-panel-card">
						<div class="card-body">
							<h2 class="h6 mb-3">Coverage Summary</h2>
							<div class="small text-muted mb-2" id="mapping-countries-count">0 countries highlighted</div>
							<div id="mapping-country-chips" class="mapping-chip-list mb-3"></div>

							<h3 class="h6 mb-2">Data Sources</h3>
							<ul class="mb-0 ps-3 small">
								<li>Africa's Climate Agenda.csv</li>
								<li>Climate Transitions.csv</li>
								<li>E&amp;S.csv</li>
								<li>Geopolitics &amp; Geoeconomics.csv</li>
								<li>Green Tech.csv</li>
							</ul>
						</div>
					</div>
				</div>

				<div class="col-lg-9 col-xl-10">
					<div class="card shadow-sm border-0 mapping-panel-card mb-4">
						<div class="card-body">
							<div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
								<div>
									<h2 class="h5 mb-1">Content Coverage Map</h2>
									<div id="mapping-country-filter-status" class="small text-muted">No country selected</div>
								</div>
							</div>

							<div class="mapping-map-shell" aria-label="Publication coverage map container">
								<div id="mapping-world-map" class="mapping-world-map" aria-label="World map showing highlighted publication countries"></div>

								<div class="mapping-map-controls" aria-label="Map controls">
									<div class="mapping-control-zoom">
										<button type="button" id="mapping-zoom-in" class="mapping-zoom-btn" aria-label="Zoom in">+</button>
										<button type="button" id="mapping-zoom-out" class="mapping-zoom-btn" aria-label="Zoom out">−</button>
									</div>

									<button type="button" id="mapping-reset-map" class="mapping-reset-btn" title="Reset map" aria-label="Reset map">
										<span class="mapping-reset-glyph" aria-hidden="true">↺</span>
										<span class="visually-hidden">Reset map</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					<div class="card shadow-sm border-0 mapping-panel-card">
						<div class="card-body">
							<div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
								<h2 class="h5 mb-0">Mapped Content</h2>
								<span id="mapping-results-count" class="badge bg-light text-dark border">0 items</span>
							</div>

							<div class="table-responsive">
								<table class="table table-hover align-middle" id="mapping-table">
									<thead>
										<tr>
											<th scope="col">Year</th>
											<th scope="col">Author</th>
											<th scope="col">Title</th>
											<th scope="col">Programme</th>
											<th scope="col">Type</th>
										</tr>
									</thead>
									<tbody id="mapping-table-body">
										<tr>
											<td colspan="5" class="text-muted py-4 text-center">
												Loading mapped publications…
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<nav id="mapping-pagination" class="mapping-pagination mt-3" aria-label="Mapped publications pages"></nav>
						</div>
					</div>

					<div id="mapping-empty-state" class="alert alert-light border mt-4 mb-0 d-none" role="status">
						No content matches the selected filters.
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
