<?php if (!defined('IN_GS')) { die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 	footer.inc.php
* @Package:	APRI Theme
* @Action:	APRI header theme for microsites and minipages
*
*****************************************************/
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta property="og:title" content="<?php get_page_clean_title(); ?>">
		
		<!-- TODO: Update the description and image for each project page 
		<meta property="og:description" content="">
		<meta property="og:image" content="https://afripoli.org/event/data/uploads/event_2558944.png"> 
		<meta property="og:url" content="https://afripoli.org/projects/greentech">
		<meta property="og:type" content="map">
	
		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:title" content="<?php get_page_clean_title(); ?>">
		<meta name="twitter:description" content="Explore Africa Climate Policy Map">
		<meta name="twitter:image" content="https://afripoli.org/event/data/uploads/event_2558944.png"> 
		<meta name="twitter:url" content="https://afripoli.org/projects/greentech">
		<meta name="twitter:site" content="@APRI_Africa">
		<meta name="viewport" content="width=device-width, initial-scale=1.0"> -->

		<title><?php get_page_clean_title(); ?> - <?php get_site_name(); ?></title>
		<meta name="robots" content="index, follow">
		<link rel="shortcut icon" type="image/png" href="//afripoli.org/uploads/logo/logo_60a657d21d6f4.png"/>
		
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
		
		<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      	<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        <script src="https://d3js.org/d3.v7.min.js"></script>
		<link href="https://afripoli.org/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link href="https://afripoli.org/assets/themes/magazine/css/plugins-2.4.min.css" rel="stylesheet">
		
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/style-2.4.min.css?v=<?php echo get_site_version(); ?>">
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/custom.css?v=<?php echo get_site_version(); ?>">
		<?php if (isset($mappingView) && $mappingView === 'themes') { ?>
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/themes-animation.css?v=<?php echo get_site_version(); ?>">
		<?php } elseif (isset($mappingView) && $mappingView === 'timeline') { ?>
		<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/assets/css/timeline.css?v=<?php echo get_site_version(); ?>">
		<?php } ?>
		<style>:root {--vr-font-primary:  "Open Sans", Helvetica, sans-serif;--vr-font-secondary:  "UncutSans Semibold","UncutSans Regular",Arial,sans-serif;--vr-font-tertiary:  "Open Sans", Helvetica, sans-serif;--vr-theme-color: #f8ae1a;--vr-block-color: #161616;--vr-mega-menu-color: #f9f9f9;}</style>
		
		
	<?php get_header(); ?>
	
	<body>
	<header id="header" class="header-area border-bottom">
	<div class="header-bottom-wrap header-sticky is-sticky">
		<div class="container-xl">
			<div class="row">
				<div class="col-lg-12">

					<div class="header position-relative">

						<div class="header__logo">
							<a href="https://afripoli.org">
								<img src="https://afripoli.org/uploads/logo/logo_60a2eb206046f.svg" alt="logo" class="logo" width="178" height="56">
							</a>
						</div>

						<div class="header-midle-box">
							<div class="header-bottom-wrap d-md-block d-none">
								<div class="header-bottom-inner">

									<div class="header-bottom-left-wrap">
										<div class="header__navigation d-none d-xl-block">

											<nav class="navigation-menu primary--menu">
												<ul>

													<li class="has-children has-children--multilevel-submenu">
														<a href="https://afripoli.org"><span>Programmes</span></a>
														<ul class="submenu">
															<li><a href="https://afripoli.org/climate-transitions"><span>Climate Transitions</span></a></li>
															<li><a href="https://afripoli.org/just-technology-transition"><span>Just Green Technology Transition</span></a></li>
															<li><a href="https://afripoli.org/geopolitics-and-geoeconomics"><span>Geopolitics &amp; Geoeconomics</span></a></li>
															<li><a href="https://afripoli.org/economy-finance-society"><span>Economy &amp; Society</span></a></li>
															<li><a href="https://afripoli.org/climate-agenda"><span>Africa's Climate Agenda</span></a></li>
															<li><a href="https://afripoli.org/africas-digital-agenda"><span>Africa’s Digital Agenda</span></a></li>
														</ul>
													</li>

													<li class="has-children has-children--multilevel-submenu">
														<a href="#"><span>Analysis</span></a>
														<ul class="submenu">
															<li><a href="/analysis/report"><span>Reports</span></a></li>
															<li><a href="https://afripoli.org/analysis/policy-paper"><span>Policy Papers</span></a></li>
															<li><a href="https://afripoli.org/analysis/policy-brief"><span>Policy Briefs</span></a></li>
															<li><a href="https://afripoli.org/analysis/short-analysis"><span>Short Analyses</span></a></li>
															<li><a href="https://afripoli.org/analysis/commentary"><span>Commentaries</span></a></li>
															<li><a href="https://afripoli.org/analysis/briefing-note"><span>Briefing Notes</span></a></li>
															<li><a href="https://afripoli.org/analysis/expert-interview"><span>Expert Interviews</span></a></li>
															<li><a href="https://afripoli.org/analysis/data-visualisation"><span>Data Visualisations</span></a></li>
															<li><a href="https://afripoli.org/podcasts"><span>Podcasts</span></a></li>
														</ul>
													</li>

													<li><a href="https://afripoli.org/our-projects"><span>Projects</span></a></li>
													<li><a href="https://afripoli.org/events"><span>Events</span></a></li>
													<li><a href="https://afripoli.org/experts"><span>Experts</span></a></li>

													<li class="has-children has-children--multilevel-submenu">
														<a href="#"><span>About</span></a>
														<ul class="submenu">
															<li><a href="https://afripoli.org/about"><span>About Us</span></a></li>
															<li><a href="https://afripoli.org/advisory-board"><span>Advisory Board</span></a></li>
															<li><a href="https://afripoli.org/annual-report"><span>Annual Report</span></a></li>
															<li><a href="https://afripoli.org/contact"><span>Contact Us</span></a></li>
															<li><a href="https://afripoli.org/opportunities"><span>Opportunities</span></a></li>
														</ul>
													</li>

												</ul>
											</nav>

										</div>
									</div>

								</div>
							</div>
						</div>

						<div class="header-right">
							<div class="header-right-inner" id="hidden-icon-wrapper">

								<div class="language-menu">
									<ul>
										<li>
											<a href="#"><i class="icon-globe"></i><span class="wpml-ls-native">En</span></a>

											<ul class="ls-sub-menu">
												<li>
													<a href="https://afripoli.org">
														<img class="ls-flag selected" alt="" title="En">
														<span class="wpml-ls-native">En</span>
													</a>
												</li>

												<li>
													<a href="https://afripoli.org/de">
														<img class="ls-flag" alt="" title="De">
														<span class="wpml-ls-native">De</span>
													</a>
												</li>
											</ul>

										</li>
									</ul>
								</div>

							</div>
						</div>

						<div class="d-none d-xl-block d-xxl-none me-2 d-flex align-items-center">
							<ul class="navbar-nav flex-row flex-wrap ms-md-auto align-items-center">

								<li class="nav-item dropdown display-flex align-items-center">
									<a href="#" class="nav-link dropdown-toggle display-flex align-items-center" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<img src="https://afripoli.org/uploads/profile/202602/avatar_1_698610f7be1d2.jpg" alt="Stephen Oloh" width="28" height="28" class="avatar-sm avatar-circle">&nbsp;
									</a>

									<ul class="dropdown-menu dropdown-menu-end">
										<li><span class="dropdown-item fw-bold">Logged in as Stephen Oloh</span></li>
										<li><a href="#" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#modalAddPost">Add Post</a></li>
										<li><a href="https://afripoli.org/apri-admin-portal" class="dropdown-item">Admin Panel</a></li>
										<li><a href="https://afripoli.org/profile/stephen-oloh" class="dropdown-item">Profile</a></li>
										<li><a href="https://afripoli.org/reading-list" class="dropdown-item">Reading List</a></li>
										<li><a href="https://afripoli.org/settings" class="dropdown-item">Settings</a></li>
										<li><a href="https://afripoli.org/logout" class="dropdown-item">Logout</a></li>
									</ul>
								</li>

							</ul>
						</div>

						<div class="header-search-form-two">
							<form action="#" class="search-form-top-active">
								<div class="search-icon" id="search-overlay-trigger">
									<a href="#" aria-label="Open Search Overlay">
										<i class="bi bi-search"></i>
									</a>
								</div>
							</form>
						</div>

						<div class="mobile-navigation-icon d-block d-xl-none me-2" id="mobile-menu-trigger">
							<i></i>
						</div>

					</div>

				</div>
			</div>
		</div>
	</div>

	<div class="mobile-menu-overlay" id="mobile-menu-overlay">

		<div class="mobile-menu-overlay__inner">

			<div class="mobile-menu-overlay__header">
				<div class="container-fluid">
					<div class="row align-items-center">

						<div class="col-md-6 col-8">
							<div class="logo">
								<a href="https://afripoli.org" class="display-inline-block">
									<img src="https://afripoli.org/uploads/logo/logo_60a2eb206046f.svg" alt="logo" class="logo" width="178" height="56">
								</a>
							</div>
						</div>

						<div class="col-md-6 col-4">
							<div class="mobile-menu-content text-right">
								<span class="mobile-navigation-close-icon" id="mobile-menu-close-trigger"></span>
							</div>
						</div>

					</div>
				</div>
			</div>

			<div class="mobile-menu-overlay__body">

				<nav class="offcanvas-navigation primary--menu">
					<ul>

						<li class="has-children">
							<span class="menu-expand"><i></i></span>
							<a class="fw-bold" href="#">Programs</a>

							<ul class="sub-menu" style="display: none;">
								<li><a href="https://afripoli.org/climate-transitions"><span>Climate Transitions</span></a></li>
								<li><a href="https://afripoli.org/just-technology-transition"><span>Just Green Technology Transition</span></a></li>
								<li><a href="https://afripoli.org/geopolitics-and-geoeconomics"><span>Geopolitics &amp; Geoeconomics</span></a></li>
								<li><a href="https://afripoli.org/economy-finance-society"><span>Economy &amp; Society</span></a></li>
								<li><a href="https://afripoli.org/climate-agenda"><span>Africa's Climate Agenda</span></a></li>
								<li><a href="https://afripoli.org/africas-digital-agenda"><span>Africa’s Digital Agenda</span></a></li>
							</ul>
						</li>

						<li class="has-children">
							<span class="menu-expand"><i></i></span>
							<a href="#">Analysis</a>

							<ul class="sub-menu" style="display: none;">
								<li><a href="/analysis/report"><span>Reports</span></a></li>
								<li><a href="https://afripoli.org/analysis/policy-paper"><span>Policy Papers</span></a></li>
								<li><a href="https://afripoli.org/analysis/policy-brief"><span>Policy Briefs</span></a></li>
								<li><a href="https://afripoli.org/analysis/short-analysis"><span>Short Analyses</span></a></li>
								<li><a href="https://afripoli.org/analysis/commentary"><span>Commentaries</span></a></li>
								<li><a href="https://afripoli.org/analysis/briefing-note"><span>Briefing Notes</span></a></li>
								<li><a href="https://afripoli.org/analysis/expert-interview"><span>Expert Interviews</span></a></li>
								<li><a href="https://afripoli.org/analysis/data-visualisation"><span>Data Visualisations</span></a></li>
								<li><a href="https://afripoli.org/podcasts"><span>Podcasts</span></a></li>
							</ul>
						</li>

						<li><a href="https://afripoli.org/our-projects"><span>Projects</span></a></li>
						<li class="active"><a href="https://afripoli.org/events"><span>Events</span></a></li>
						<li><a href="https://afripoli.org/experts"><span>Experts</span></a></li>

						<li class="has-children">
							<span class="menu-expand"><i></i></span>
							<a href="#">About</a>

							<ul class="sub-menu" style="display: none;">
								<li><a href="https://afripoli.org/about"><span>About Us</span></a></li>
								<li><a href="https://afripoli.org/advisory-board"><span>Advisory Board</span></a></li>
								<li><a href="https://afripoli.org/annual-report"><span>Annual Report</span></a></li>
								<li><a href="https://afripoli.org/contact"><span>Contact Us</span></a></li>
								<li><a href="https://afripoli.org/opportunities"><span>Opportunities</span></a></li>
							</ul>
						</li>

						<li class="has-children border-0">
							<span class="menu-expand"><i></i></span>
							<a href="#">Language</a>

							<ul class="sub-menu" style="display: none;">
								<li><a href="https://afripoli.org" class="selected">En</a></li>
								<li><a href="https://afripoli.org/de">De</a></li>
							</ul>
						</li>

					</ul>
				</nav>

			</div>

		</div>
	</div>
</header>

	<div class="search-overlay" id="search-overlay">
		<div class="search-overlay__header">
			<div class="container-fluid">
				<div class="row align-items-center">
					<div class="col-md-6 ms-auto col-4">
						<!-- search content -->
						<div class="search-content text-end">
							<span class="mobile-navigation-close-icon" id="search-close-trigger"></span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="search-overlay__inner">
			<div class="search-overlay__body">
				<div class="search-overlay__form">
					<form action="https://afripoli.org/search" method="get">
						<input type="text" name="q" maxlength="300" pattern=".*\S+.*" class="form-control form-input" placeholder="Search..." required>
					</form>
				</div>
			</div>
		</div>
	</div>
