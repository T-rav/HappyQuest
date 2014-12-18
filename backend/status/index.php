<?php

	ini_set('display_errors', true);
	error_reporting(E_ALL);

	$jqueryFormat = isset($_GET['jsoncallback']);

	$url = "http://loadshedding.eskom.co.za/LoadShedding/GetStatus";

	$data = fetchData($url);
	$data = $data - 1;

	$result = array();
	$result["level"] = $data;
	//$result["level"] = 1;

	$returnData = convertToJson($result);

	if($jqueryFormat){
		header('Content-Type:application/x-javascript');
		$fnName = $_GET['jsoncallback'];
		echo $fnName." (".$returnData.")";
	}else{
		header('Content-Type:text/json');
		echo $returnData;
	}	

	function fetchData($url){
		$data = file_get_contents($url);
	
		return $data;
	}

	function convertToJson($dataToDump){
	
		return json_encode($dataToDump, true);
	}

?>