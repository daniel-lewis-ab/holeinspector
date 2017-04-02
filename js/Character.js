
"use strict";

window.Characters = {};
class Character extends Thing {
	
	constructor(p = {}) {
		super();
		
		this.characterName = '';
		this.characterID = 0;
		this.corporationID = 0;
		this.allianceID = 0;
		this.shipTypeID = 0;
		this.shipTypeName = '';
		this.systemID = 0;
		
		this.e = {};
		this.e.li = null;
		this.e.name = null;
		this.e.shipIcon = null;
		this.e.shipName = null;
		this.e.list = null;
		
		this.system = null;
		
		Characters[p.characterID] = this;
		this.update(p);
	}
	destructor(){
		this.undraw();
		delete Characters[this.characterID];
	}
	update(p = {}){
		
		//@TODO: system.id vs system.systemId is fucking this up in my head.
		// create the system on the server when a character moves into a new system, before even sending data to the client.
		// also translate the systemId to a system.id for character location
		let i;
		var sys;
		var kspace = {'H':1,'L':1,'N':1};
		
		for(i in Systems)
			if(Systems[i].systemID == p.systemID)
				sys = Systems[i];
		if(!sys){
			console.log('system not found '+p.systemID);
			return;
		}
		if(sys == this.system){
			console.log('character hasn\'t changed systems.');
		}
		else if(this.system){
			if(sys.posX == 0 || sys.posY == 0)
				sys.setPosition(this.system.posX+120, this.system.posY+2);
			let f = false;
			for(i in Connections){
				if(
					(Connections[i].sourceSystemID == this.system.systemID && Connections[i].targetSystem == sys)
					||
					(Connections[i].targetSystemID == this.system.systemID && Connections[i].sourceSystem == sys)
				){
					console.log('connection exists');
					f = true;
					break;
				}
			}
			if(!f){
				if(!this.system.classification in kspace || !sys.classification in kspace){
					console.log('draw a new connection between '+this.system.systemName+' and '+sys.systemName);
					this.chain.addConnection( this.system, sys );
				}
				else {
					console.log('not automatically drawing connections between kspace systems');
				}
			}
		}
		this.system = sys;
		super.update(p);
	}
	
	draw(){
		this.drawToChain();
		this.drawToHeader();
	}
	
	drawToHeader(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToHeader());
			return;
		}
		$.getId('characterCount').innerText = Object.keys(Characters).length;
		if(! (this.e.list instanceof Element)){
			this.e.list = this.e.li.cloneNode(1);
			$.getId('characterList').appendChild(this.e.list);
		}
		this.e.list = this.e.li.cloneNode(1);
	}
	
	drawToChain(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToChain());
			return;
		}
		// list
		if(! (this.e.li instanceof Element)){
			this.e.li = $.createElement('li');
		}
		this.system.e.chars.appendChild(this.e.li);
		
		// name
		if(! (this.e.name instanceof Element)){
			this.e.name = $.createElement('span');
			this.e.li.appendChild(this.e.name);
		}
		this.e.name.innerText = this.characterName;
		
		if(! (this.e.shipIcon instanceof Element)){
			this.e.shipIcon = $.createElement('img');
			this.e.li.appendChild(this.e.shipIcon);
		}
		this.e.shipIcon.src = "https://image.eveonline.com/Type/"+(this.shipTypeID||0)+"_32.png";
		
		// shipName
		if(! (this.e.shipName instanceof Element)){
			this.e.shipName = $.createElement('span');
			this.e.li.appendChild(this.e.shipName);
		}
		this.e.shipName.innerText = this.shipTypeName;
		this.system.chain.jsPlumbInstance.revalidate(this.system.e.div);
	}
}
