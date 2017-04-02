<?php

require_once 'Api.php';

try {
	$API = new API();
	echo $API->processAPI();
} catch (Exception $e) {
	echo json_encode(Array('error' => $e->getMessage()));
}

?>