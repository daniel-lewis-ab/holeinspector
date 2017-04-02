<?php

class Database extends PDO implements Serializable {

	public $host;
	public $user;
	public $pass;
	public $dbname;

	public function __construct(string $host, string $user, string $pass, string $dbname){
		// echo 'new Database()';
	
		$this->host = $host;
		$this->user = $user;
		$this->pass = $pass;
		$this->dbname = $dbname;
		$dsn = 'mysql:dbname='.$this->dbname.';host='.$this->host.';charset=utf8';
		
		parent::__construct(
			$dsn, 
			$this->user, 
			$this->pass, 
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_PERSISTENT => true
			)
		);
	}
	
	public function safeString(string $str, int $maxLength) : string {
		if(strlen($str) > $maxLength)
			$str = substr($str, $maxLength-3).'...';
		return '\''.$str.'\'';
	}
	public function safeEnum(int $n, array $choices, int $default) : int {
		if(in_array($n, $choices))
			return $n;
		else
			return $default;
	}
	
	public function set(array $arguments = NULL, string $sql) : int {
		try {
			$stmt = $this->prepare($sql);
			$stmt->execute($arguments);
			return $stmt->rowCount();
		}
		catch(PDOException $e){
			echo '<h2>Database Error</h2>
			<p>'.json_encode($arguments).'</p>
			<p>'.$sql.'</p>';
			return 0;
		}
	}
	public function get(array $arguments = NULL, string $sql){
		$stmt = $this->prepare($sql);
		$stmt->execute($arguments);
		return $stmt;
	}
	public function getColumn(array $arguments = NULL, string $sql) : array {
		$stmt = count($arguments) ? 
			$this->get($arguments, $sql) : 
			$this->query($sql);
		return $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
	}
	public function getAssoc(array $arguments = NULL, string $sql) : array {
		$stmt = count($arguments) ? 
			$this->get($arguments, $sql) : 
			$this->query($sql);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}
	public function getArray(array $arguments = NULL, string $sql) : array {
		$stmt = count($arguments) ? 
			$this->get($arguments, $sql) : 
			$this->query($sql);
		return $stmt->fetchAll(PDO::FETCH_NUM);
	}
	public function getProperties($self, array $arguments = NULL, string $sql) {
		$stmt = $this->prepare($sql);
		$stmt->setFetchMode(PDO::FETCH_INTO, $self);
		$stmt->execute($arguments);
		$stmt->fetch();
	}
	public function serialize(){
		return json_encode( $this );
	}
	public function unserialize($data){
		$o = json_decode($data);
		$this->__construct( $o->host, $o->user, $o->pass, $o->dbname );
	}
}

?>
