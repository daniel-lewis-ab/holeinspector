<?php

class Curl {	
	public static function fetch(string $path, string $header) : string {
		$ch = curl_init();
		curl_setopt_array(
			$ch,
			array(
				CURLOPT_URL             => $path,
				CURLOPT_HTTPHEADER      => array($header),
				CURLOPT_RETURNTRANSFER  => true,
				CURLOPT_USERAGENT       => 'Hole Inspector by Avice/0.4.54',
				CURLOPT_SSL_VERIFYPEER  => true,
				CURLOPT_SSL_CIPHER_LIST => 'TLSv1', //prevent protocol negotiation fail
			)
		);
		$responseText = curl_exec($ch);
		$info = curl_getinfo($ch);
		$errorNumber  = curl_errno($ch);
		$errorMessage = curl_error($ch);
		curl_close($ch);
		if($errorNumber){
			throw new Exception($errorNumber, $errorMessage, $responseText);
		}
		return $responseText;
	}
	public static function post(string $path, string $header, array $arguments) : string {
		$fields = Curl::assocToFields( $arguments );
		$ch = curl_init();
		curl_setopt_array(
			$ch,
			array(
				CURLOPT_URL             => $path,
				CURLOPT_POST            => true,
				CURLOPT_POSTFIELDS      => $fields,
				CURLOPT_HTTPHEADER      => array($header),
				CURLOPT_RETURNTRANSFER  => true,
				CURLOPT_USERAGENT       => 'Hole Inspector by Avice/0.4.54',
				CURLOPT_SSL_VERIFYPEER  => true,
				CURLOPT_SSL_CIPHER_LIST => 'TLSv1', //prevent protocol negotiation fail
			)
		);
		$responseText = curl_exec($ch);
		$info = curl_getinfo($ch);
		$errorNumber  = curl_errno($ch);
		$errMessage = curl_error($ch);
		curl_close($ch);
		if($errorNumber){
			throw new Exception($errorMessage."\n".$responseText, $errorNumber);
		}
		return $responseText;
	}
	protected static function assocToFields(array $assocFields) : string {
		if(count($assocFields) == 0)
			return '';
		$fields = '';
		foreach($assocFields as $k => $v){
			$fields = $fields.$k.'='.$v.'&';
		}
		$fields = rtrim($fields,'&');
		return $fields;
	}
}


?>