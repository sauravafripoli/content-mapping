<?php if (!defined('IN_GS')) { die('you cannot load this page directly.'); } ?>
<?php
$mappingView = isset($_GET['view']) ? trim((string) $_GET['view']) : 'dashboard';
if (!in_array($mappingView, ['dashboard', 'themes', 'timeline'], true)) {
	$mappingView = 'dashboard';
}

$componentFile = __DIR__ . '/components/' . $mappingView . '.php';
if (!file_exists($componentFile)) {
	$mappingView = 'dashboard';
	$componentFile = __DIR__ . '/components/dashboard.php';
}
?>
<?php include('header.inc.php'); ?>
<?php include($componentFile); ?>
<?php include('footer.inc.php'); ?>
