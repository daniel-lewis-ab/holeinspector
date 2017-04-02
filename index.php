<?php
	require_once('v1/Api.php');
	$API = new API();
	$characters = json_decode($API->callAPI('GET','characters'));
?><!DOCTYPE html>
<html>
<head>

<title>Hole Inspector by Avice</title>

<!-- meta -->
<meta charset="utf-8">
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width">

<!-- lib -->
<script src="js/jsplumb-2.2.8.min.js"></script>
<script src="js/fastlib-0.2.0.js"></script>
<!-- app -->
<link rel="stylesheet" href="css/style.css">
<script>
Config = {
	stop:0,
	test:1
};
</script>
<script src="js/Panel.js"></script>
<script src="js/Thing.js"></script>
<script src="js/Character.js"></script>
<script src="js/Updater.js"></script>
<script src="js/Chain.js"></script>
<script src="js/System.js"></script>
<script src="js/Connection.js"></script>
<script src="js/Signature.js"></script>
<script src="js/Context.js"></script>
</head>
<body>

<header>
<nav>
<ul>
	<li id="character">
		<?php
			echo '<a><img src="https://imageserver.eveonline.com/Character/'.(count($characters)? $characters[0]->characterID : 0).'_32.jpg">'.
				'<span>'.(count($characters)? $characters[0]->characterName : 'New User').'</span></a>';
		?>
		<ul>
			<?php
			foreach($characters as $ch){
				echo '<li><a><img src="https://imageserver.eveonline.com/Character/'.($ch->characterID? $ch->characterID : 0).'_32.jpg">'.
				'<span>'.($ch->characterName? $ch->characterName : 'New User').'</span></a><ul>
					<li><a onclick="Updater.fetch(\'/shek/v1/characters/'.$ch->characterID.'/switch/\',undefined,undefined,\'POST\',1);">Switch</a></li>
					<li><a onclick="Updater.fetch(\'/shek/v1/characters/'.$ch->characterID.'/\',undefined,undefined,\'DELETE\',1);">Remove</a></li>
				</ul></li>';
			}
			?>
			<li><a href="/shek/v1/characters/add/">Add Character</a></li>
			<li><a id="user_remove" onclick="Updater.fetch(\'/shek/v1/user/\',undefined,{},\'DELETE\');">Forget User</a></li>
		</ul>
	</li>
	<li id="opens">
		<a>Show</a>
		<ul>
			<li><a id="show_chain">Chain</a></li>
			<li><a id="show_system">System</a></li>
			<li><a id="show_signatures">Signature</a></li>
		</ul>
	</li>
	<li>
		<a>Links</a>
		<ul>
			<li><a target="blank" href="https://shkl.slack.com/">Slack</a></li>
			<li><a target="blank" href="https://eve-central.com/home/">Eve-Central</a></li>
			<li><a target="blank" href="https://docs.google.com/document/d/1qwvhx08l8IJIyaIF0LP7IYmmQnI_LQ-YIoyCFx1Nslg/edit">Bookmarking Guide</a></li>
			<?php 
				if( $user->currentCharacter->corporationID == 98467521 ){
					echo '
			<li><a target="blank" href="https://docs.google.com/forms/d/e/1FAIpQLSeT6Y4QGNI0BL1xdgb9WfluxVVCZNzBWBWu0Zg4qnrJ6QEUDg/viewform?c=0&w=1">Income Tracking</a></li>
			<li><a target="blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdrSXz0R7DOi2MhAod3c0nS5doOG3Zs4qBcUTMhYiXrTYdEsQ/viewform?c=0&w=1">Debt Tracking</a></li>';
				}
			?>
		</ul>
	</li>
	<li>
		<a>Todo</a>
		<ul>
		<li>
<pre>
Server	API getAll() Last-Modified is always the one for Signatures, so cache sometimes doesn't update right away.

Updater:
Client	Would DOS my server if it didn't have an openRequest filter, because of some bug.
Client	Doesn't remove old items that are not in the JSON being passed to the update functions.

User/Character:
Server	Adding a character doesn't create a User, see `step3_select_character`
Both		Not updating SQL with my character's locations

System:	OK

Connections:
Server	add fails server-side: error invalid argument sourceSystemID
Server	SQL Error for UPDATE /v1/chains/5/connections/2347/ with type
Both		setting mass goals not fully implemented

Signatures:
Server	SQL Error for INSERT /v1/chains/5/systems/31002287/signatures/2523/
Client	Chains[#].systems[undefined] is undefined
Client	scanning signatures doesn't set the Subtype.  
</pre>
		</li>
		</ul>
	</li>
	<li>
		<a>Active Users <span id="characterCount">0</span></a>
		<ul id="characterList">
		</ul>
	</li>
</ul>
</nav>
</header>



<dialog id="chain">
	<header>Chain</header>
	
	<nav>
	<ul>
	</ul>
	</nav>
	
	<a class="close">x</a>
	
	<main>
		<nav type="context" id="systemContext" label="system">
		<ul>
			<li><span id="systemContext_name">System</span></li>
			<li><a id="systemContext_lock">Lock</a></li>
			<li><a id="systemContext_rally">Rally</a></li>
			<li><a id="systemContext_remove">Remove</a></li>
		</ul>
		</nav>
		
		<nav type="context" id="connectionContext" label="connection">
		<ul>
			<li><span>Connection</span> <span id="connectionContext_id"></span></li>
			<li><a id="connectionContext_meol">EOL</a></li>
			<li><a id="connectionContext_mfrigate">Frigate</a></li>
			<li>
				<a>Mass</a>
				<ul>
				<li><a id="connectionContext_mfresh">Fresh</a></li>
				<li><a id="connectionContext_mreduced">Reduced</a></li>
				<li><a id="connectionContext_mcritical">Critical</a></li>
				</ul>
			</li>
			<li>
				<a>Set Goal</a>
				<ul>
				<li><a id="connectionContext_psave">Please Save</a></li>
				<li><a id="connectionContext_pcrit">Please Crit</a></li>
				<li><a id="connectionContext_proll">Please Roll</a></li>
				</ul>
			</li>
			<li><a id="connectionContext_remove">Remove</a></li>
		</ul>
		</nav>
		
		
		<nav type="context" id="chainContext" label="chain">
		<ul>
			<li><span id="chainContext_name">Chain</span></li>
			<li>
				<a id="chainContext_add">Add system</a>
				<ul>
				<li>
					<fieldset>
					<label for="chainContext_systemName">Name</label><input id="chainContext_systemName"></input>
					<button id="chainContext_addSubmit">Add</button>
					</fieldset>
				</li>
				</ul>
			</li>
		</ul>
		</nav>
		
		<section id="chain_+" class="chain">
		<form onsubmit="Updater.fetch('/v1/chains/add/',undefined,this,'POST',1);return false;">
		<fieldset>
		<h4>Add Chain</h4>
		<ul>
			<li><label>Name</label><input name="name"></input></li>
			<li><label>Type</label>
				<select name="type">
					<option value="2">private</option>
					<option value="3">corporation</option>
					<option value="4">alliance</option>
				</select>
			</li>
			<li><label>Delete Old Connections</label><input type="checkbox" name="deleteExpiredConnections" value="false" checked="false"></li>
			<li><label></label><input type="submit" value="Add"></input></li>
		</ul>
		</fieldset>
		</form>
		<form id="change_chain_form" onsubmit="Updater.fetch('/v1/chains/'+$.getId('chain_select_name').value+'/',undefined,this,'POST',1);return false;">
		<fieldset>
		<h4>Edit Chain</h4>
		<ul>
			<li><label>Which</label>
				<select name="which" id="chain_select_name">
				</select>
			<li><label>Name</label><input name="name"></input></li>
			<li><label>Type</label>
				<select name="type">
					<option value="2">private</option>
					<option value="3">corporation</option>
					<option value="4">alliance</option>
				</select>
			</li>
			<li><label>Delete Old Connections</label><input type="checkbox" name="deleteExpiredConnections" value="0" checked="0"></li>
			<li><label></label><input type="submit" value="Change"></input></li>
			<li><label></label><input type="button" value="Delete" onclick="if(confirm('Are you sure you want to delete this chain?')) Updater.fetch('/v1/chains/'+$.getId('chain_select_name').value+'/',undefined,undefined,'DELETE',1);return false;"></input></li>
		</ul>
		</fieldset>
		</form>
		</section>
	</main>
</dialog>


<dialog id="system">
	<header>System</header>
	
	<nav>
	<ul>
		<li><a><span id="system_security" class="security" style="font-weight:bold;"></span>&nbsp;&nbsp;<span id="system_name"></span>&nbsp;&raquo;&nbsp;<span id="system_constellation"></span>&nbsp;&raquo;&nbsp;<span id="system_region"></span></a></li>
		<li><a id="system_dotlan" target="blank"><img src="data:image/png;base64,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"></a></li>
		<li><a id="system_pasta" target="blank"><img src="data:image/png;base64,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"></a></li>
		<li><a id="system_zkill" target="blank"><img style="width:17px;height:17px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4je2SO4qEQBRFyx8ICi7B0H0IbsMtuA7dh2kJJhqYFegrSsQdnYmmoeme6W6aDgYmuMkLDod3r1JK8Wb+AUopwjDEGINzDhHBWsu2bez7znmeHMeBtRYRwTmHMQbP8z5oICKs63pl8H3/0SDPc7TWDwHjOFIUxf0npmlK13VorW8Afd/Tti1Zlv3eQhAE1HXNNE0XwDAMNE1DFEXP11iWJcuyMM8zVVXh+/7rO4jjmCRJ/sIS38kXXJlyaWwo8CcAAAAASUVORK5CYII="></a></li>
	</ul>
	</nav>
	
	<a class="close">x</a>
	
	<main>
		<fieldset>
		<ul>
			<li>
				<label for="system_corpticker">Occupants</label>
				<input id="system_corpticker" maxlength="5" onblur="Chains.current.selectedSystem.setTicker(this.value);"></span>
				<a id="system_ticker" target="blank"><img style="width:17px;height:17px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4je2SO4qEQBRFyx8ICi7B0H0IbsMtuA7dh2kJJhqYFegrSsQdnYmmoeme6W6aDgYmuMkLDod3r1JK8Wb+AUopwjDEGINzDhHBWsu2bez7znmeHMeBtRYRwTmHMQbP8z5oICKs63pl8H3/0SDPc7TWDwHjOFIUxf0npmlK13VorW8Afd/Tti1Zlv3eQhAE1HXNNE0XwDAMNE1DFEXP11iWJcuyMM8zVVXh+/7rO4jjmCRJ/sIS38kXXJlyaWwo8CcAAAAASUVORK5CYII="></a>
			</li>
			<li>
				<label>Effect</label><span id="system_effect"></span>
			<li>
				<label for="system_statussel">Status</label><select id="system_statussel" onchange="Chains.current.selectedSystem.setStatusId(this.value);"></select>
			</li>
			<li>
				<label>Statics</label>
				<ul id="system_statics">
				</ul>
			</li>
		</ul>
		</fieldset>
		<textarea id="system_description" onblur="Chains.current.selectedSystem.setDescription(this.value);" value="description">description</textarea>
	</main>
</dialog>



<dialog id="signatures">
	<header><a>Signatures</a></header>
	
	<nav>
	<ul>
		<li><a id="addSignature">Add Signature</a></li>
	</ul>
	</nav>
	
	<a class="close">x</a>
	
	<main>
		<textarea id="signaturepost" value="paste signatures here">paste signatures here</textarea>
		<table id="signaturesTable">
			<thead>
				<tr><td>[SIG]</td><td>Type</td><td>SubType</td><td>State</td><td>Resources</td><td>Description</td><td>Found</td><td>Updated</td></tr>
			</thead>
			<tbody id="signaturesTbody"></tbody>
		</table>
	</main>
</dialog>

<footer>
<nav>
<ul>
	<li>Hole Inspector by Avice, &copy;</li>
</ul>
</nav>
</footer>
</body>
</html>