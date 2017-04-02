<?php

abstract class Rest {
    
	protected $token = '';
	protected $request = Array();
	protected $id = '';
	protected $args = Array(); // Any additional URI components after the endpoint and verb have been removed, in our case, an integer ID for the resource. eg: /<endpoint>/<verb>/<arg0>/<arg1> or /<endpoint>/<arg0>
	protected $file = null; // Stores the input of the PUT request
	protected $endpoint = ''; // DEPRECATED
	protected $verb = ''; // DEPRECATED

	public function __construct() {
		$this->token = $_COOKIE['token'];
	}
	public function processAPI() {
		header('Access-Control-Allow-Orgin: *');
		header('Access-Control-Allow-Methods: *');
		header('Pragma: cache');
		header('Content-Type: application/json; charset=UTF-8');
		
		$this->request = $request = $_REQUEST['request'];
		$method = strtolower($_SERVER['REQUEST_METHOD']);
		if ($method == 'post' && array_key_exists('HTTP_X_HTTP_METHOD', $_SERVER)) {
			if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'DELETE') {
				$method = 'delete';
			} else if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'PUT') {
				$method = 'put';
			} else {
				throw new Exception('Unexpected Header');
			}
		}
		return $this->callAPI($method, $request);
	}
	public function callAPI($method, $request){
		$this->args = explode('/', strtolower(rtrim($request, '/')) );
		$this->endpoint = array_shift($this->args);
		if (array_key_exists(0, $this->args) && is_numeric($this->args[0])) {
			$this->id = (int) array_shift($this->args);
		}
		if (array_key_exists(0, $this->args) && !is_numeric($this->args[0])) {
			$this->verb = ucfirst( array_shift($this->args) );
		}
		switch($method) {
			case 'put':
				$this->file = file_get_contents("php://input");
			case 'delete':
			case 'post':
			case 'get':
				$this->request = array();
				foreach($_REQUEST as $k => $v){
					if($k != 'request')
						$this->request[$k] = $v;
				}
				break;
			default:
				$this->_response('Invalid Method', 405);
				break;
		}
		if (is_callable(array($this, $this->endpoint.'_'.$method.$this->verb))){
			return $this->_response($this->{$this->endpoint.'_'.$method.$this->verb}($this->args));
		}
		return $this->_response('No Endpoint: '.$this->endpoint.'_'.$method.$this->verb, 404);
	}
	private function _response($data, $status = 200) {
		header("HTTP/1.1 " . $status . " " . $this->_requestStatus($status));
		return json_encode($data, JSON_NUMERIC_CHECK);
	}
	private function _requestStatus($code) {
		$status = array(  
			200 => 'OK',
			403 => 'Access Denied',
			404 => 'Not Found',   
			405 => 'Method Not Allowed',
			500 => 'Internal Server Error',
		); 
		return ($status[$code]) ? $status[$code] : $status[500]; 
	}
}

?>