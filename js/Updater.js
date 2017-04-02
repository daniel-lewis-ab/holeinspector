
"use strict";

/*
	Updater Singleton
	
	Data is pulled from the server via polling, which is less frequent
	when the tool is in the background.

	@TODO: Implement EventSource server pushing.

	Data is uploaded to the server via events and checked in PHP,
	which may or may not ignore the result.
	
	Updater can't really be bound to any Object because we want to minimize
	concurrent pulls and just send bigger ones, and because Updater is
	what pulls which Chains are available to the user.
*/

class __Updater {
	
	constructor(basePath) {
		this.basePath = basePath;
		this.poll = null;
		this.pollRate = 5000;
		this.openRequest = false;
		this.requests = {};
		
		if($.readyState === "complete"){
			this.setPoll();
		}
		else {
			window.addEventListener('DOMContentLoaded',() => this.setPoll());
		}
		
		window.addEventListener('focus',(ev) => {
			this.setPoll(5000);
		});
		
		window.addEventListener('blur',(ev) => {
			this.setPoll(60000);
		});
	}
	
	setPoll(n){
		if(n)
			this.pollRate = n;
		this.requestUpdate();
		clearInterval(this.poll);
		this.poll = setInterval(() => this.requestUpdate(), this.pollRate);
	}
		
	responseHandler(s){
		if(Config.test)
			console.log('Updater.responseHandler()');
		
		// @TODO: Client sometimes doesn't arrive here for updates, and this causes the following variable to remain true, disallowing further requests.
		// Removing it reveals a weird bug in Chrome that spins hundreds of request a second.
		this.openRequest = false;
		
		if(!s.length)
			return;
		
		console.log(s);
		
		if(!s.length)
			return;
		
		let o = JSON.parse(s);
			
		if(o.hasOwnProperty('chains'));
			this.updateChains(o.chains);
		if(o.hasOwnProperty('systems'))
			this.updateSystems(o.systems);
		if(o.hasOwnProperty('connections'))
			this.updateConnections(o.connections);
		if(o.hasOwnProperty('characters'))
			this.updateCharacters(o.characters); // has to go after systems and connections so characters can move to new systems
		if(o.hasOwnProperty('signatures'))
			this.updateSignatures(o.signatures);
	}
	
	requestUpdate(){
		//@TODO poll technique (replace ASAP)
		if(Config.stop || this.openRequest)
			return;
		
		this.openRequest = true;
		
		let path = '/v1/chains/all/';
		if(Chains.current instanceof Chain){
			path = '/v1/chains/'+Chains.current.id+'/all/';
			if(Chains.current.selectedSystem instanceof System){
				path += Chains.current.selectedSystem.systemID+'/';
			}
		}
		
		this.fetch(
			path,
			(s) => {
				this.responseHandler(s);
			},
			{}
		);
	}
	
	defaultResponseHandler(s){
		if(Config.test)
			console.log(s);
	}
	
	encodeArguments(p = {}){
		var s = '';
		var f = false;
		for(var i in p) {
			if(f)
				s += '&';
			s += encodeURIComponent(i) + '=' + encodeURIComponent(p[i]);
			f = true;
		}
		return (f?'?':'')+s;
	}
	fetch(p, x = this.defaultResponseHandler, a = {}, m = 'GET', refresh = false){
		if(Config.local)
			return;
		
		if(a instanceof Element){
			let fd = new FormData(a);
			a = {};
			for(let pair of fd.entries()){
				a[pair[0]] = pair[1];
			}
		}
		let path = this.basePath+p+this.encodeArguments(a);
		
		if(Config.test)
			console.log('Updater.fetch("'+m+','+path+'");');
		
		this.xhr = new XMLHttpRequest();
		var resp;
		var err;
		var stat;
		this.xhr.open(m,path,true);
		this.xhr.onload = () => {
			resp = this.xhr.responseText;
			err = this.xhr.statusText;
			stat = this.xhr.status;
			if (stat == 200 && resp.toLowerCase().indexOf('error') == -1){
				x(resp);
				if(refresh)
					window.location.href = 'http://gettheelectrician.com/shek/';
			}
			else if(stat == 0 || stat == 502){
				
			}
			else if(stat == 404){
				console.log(
`
Critical Error:
Request to ${path} failed with Error 404 : ${err}
Response: ${resp}
`
				);
				clearInterval(this.poll);
			}
			else if(stat != 0){
				console.log(
`
Error:
Request to ${path} failed with Error ${stat} : ${err}
Response: ${resp}
`
				);
			}
		};
		this.xhr.send();
	}
	
	updateChains(a){
		if(!(a instanceof Array))
			return;
		
		for(let i = 0; i < a.length; i++){
			let p = a[i];
			
			if(p.id in Chains)
				Chains[p.id].update(p);
			else 
				new Chain(p);
			
			if(i == 0 && !(Chains.current instanceof Chain))
				Chains[p.id].setCurrent();
		}
	}
	
	updateSystems(a){
		if(!(a instanceof Array))
			return;
		
		for(let i = 0; i < a.length; i++){
			let p = a[i];
			
			if(p.systemID in Systems)
				Systems[p.systemID].update(p);
			else
				new System(p);
		}
	}
	updateConnections(a){
		if(!(a instanceof Array))
			return;

		for(let i = 0; i < a.length; i++){
			let p = a[i];
			
			if(p.connectionID in Connections)
				Connections[p.connectionID].update(p);
			else
				new Connection(p);
		}
	}
	updateSignatures(a){
		if(!(a instanceof Array))
			return;
		
		for(let i = 0; i < a.length; i++){
			let p = a[i];
			
			if(p.signatureID in Signatures)
				Signatures[p.signatureID].update(p);
			else 
				new Signature(p);
		}
	}
	updateCharacters(a){
		if(!(a instanceof Array))
			return;
	
		for(let i = 0; i < a.length; i++){
			let p = a[i];
			
			if(p.characterID in Characters)
				Characters[p.characterID].update(p);
			else 
				new Character(p);
		}
	}
}

const Updater = new __Updater("http://gettheelectrician.com/shek");
