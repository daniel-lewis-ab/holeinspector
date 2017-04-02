
"use strict";

window.Systems = new Map();
class System extends Thing {
	
	constructor(p = {}){
		super();
	
		// hi_solar_system immutable
		this.regionID = 0;
		this.constellationID = 0;
		this.systemID = '';
		this.regionName = '';
		this.constellationName = '';
		this.systemName = '';
		this.space = '';
		this.classification = '';
		this.effect = '';
		this.truesec = 0.0;
		this.security = 0.0;
		
		// pulled in immutables
		this.statics = [];
		this.neighbours = [];
		if(!p.statics)
			p.statics = '';
		p.statics = p.statics.toString().split(',') || [];
		if(!p.neighbours)
			p.neighbours = '';
		p.neighbours = p.neighbours.toString().split(',') || [];
		
		// hi_system mutable
		this.chainID = 0;
		this.active = 1;
		this.occupancy = 0;
		this.locked = 0;
		this.rally = 0;
		this.posX = 0;
		this.posY = 0;		
		this.alias = '';
		this.ticker = '';
		this.description = '';
		this.updated = new Date(0);
		this.updatedCharacterID = '';		
		this.chain = Chains[p.chainID];
		this.signatures = {};
		
		// local properties for #chain
		this.e = {};
		this.e.div = null;
		this.e.sec = null;
		this.e.alias = null;
		this.e.name = null;
		this.e.eff = null;
		this.e.ti = null;
		this.e.lock = null;
		this.e.chars = null;
		this.endpoint = null;
		
		// local properties for #system
		
		
		// local properties for #signature
		this.e.sig = null;
		
		this.update(p);
		this.chain.systems[this.systemID] = this;
		Systems[this.systemID] = this;
	}	
	destructor(){
		for(let i in this.chain.connections){
			let con = this.chain.connections[i];
			if(con.sourceSystemID == this.systemID || con.targetSystemID == this.systemID){
				con.destructor();
			}
		}
		this.undraw();
		delete Systems[this.systemID];
		delete this.chain.systems[this.systemID];
	}
	evMouseup(ev){
		if(ev.button != 0)
			return;
	
		let posX = parseInt(ev.currentTarget.style.left);
		let posY = parseInt(ev.currentTarget.style.top);
		
		if(posX == this.posX && posY == this.posY){
			this.setCurrent();
		}
		else {
			this.setPosition(posX, posY);
		}
	}
	evContextmenu(ev){
		super.evContextmenu(ev);
		SystemContext.show(ev, this);
	}
	evDblclick(ev){
		var ea = $.createElement('input');
		ea.value = this.alias;
		ea.maxlength = '32';
		ea.bind('blur',(ev) => this.evAliasBlur(ev));
		this.e.div.replaceChild(ea, this.e.alias);
		this.e.alias = ea;
		this.drawToChain();
		this.e.alias.focus();
	}
	evAliasBlur(ev){
		if(Config.test)
			console.log('User changed the alias of '+this.systemName);
		this.setAlias(ev.currentTarget.value);
		if(this.e.div.contains(this.e.alias))
			this.e.div.removeChild(this.e.alias);
		this.e.alias = null;
		this.drawToChain();
	}
	evResize(ev){
		console.log('resized System');
		this.chain.jsPlumbInstance.revalidate(this.e.div);
	}
	draw(){
		this.drawToChain();
		this.drawToSignature();
		if(this == Chains.current.selectedSystem)
			this.drawToSystem();
	}
	undraw(){
		this.chain.jsPlumbInstance.remove(this.e.div);
		super.undraw();
	}
	drawToChain(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToChain());
			return;
		}
		if(!(this.chain.e.section instanceof Element))
			this.chain.draw();
		
		var x = this;
		var f = false;
		
		// main element
		if(!(this.e.div instanceof Element)){
			var f = true;
			this.e.div = $.createElement('div');
			this.e.div.id = this.systemName;
			this.e.div.classList.add('system');
			this.e.div.bind('mouseup', (ev) => this.evMouseup(ev));
			this.e.div.bind('contextmenu', (ev) => this.evContextmenu(ev));
			this.e.div.bind('dblclick', (ev) => this.evDblclick(ev));
			this.e.div.bind('resize', (ev) => this.evResize(ev));
		}
		this.e.div.style.left = this.posX+'px';
		this.e.div.style.top = this.posY+'px';
		this.e.div.classListSelect(System.occupancies, System.occupancies[this.occupancy]);
		this.e.div.classList.toggle('selected',this == this.chain.selectedSystem);
		
		// classification span
		if(!(this.e.sec instanceof Element)){
			this.e.sec = $.createElement('span');
			this.e.sec.classList.add('classification');
			this.e.div.appendChild(this.e.sec);
		}
		this.e.sec.classListSelect(System.classifications, this.classification); 
		this.e.sec.innerText = this.classification;
		
		// alias span
		if(!(this.e.alias instanceof Element)){
			this.e.alias = $.createElement('span');
			this.e.alias.classList.add('alias');
			this.e.div.appendChild(this.e.alias);
		}
		this.e.alias.innerText = this.alias;
		
		//	// name span
		//	@TODO: Convert Aliases to not include this.name in DB
		if(!(this.e.name instanceof Element)){
			this.e.name = $.createElement('span');
			this.e.name.classList.add('name');
			this.e.div.appendChild(this.e.name);
		}
		this.e.name.innerText = this.systemName;
		
		// effect span
		if(!(this.e.eff instanceof Element)){
			this.e.eff = $.createElement('span');
			this.e.eff.classList.add('effect');
			this.e.div.appendChild(this.e.eff);
		}
		this.e.eff.innerText = this.effect.charAt(0).toUpperCase();
		this.e.eff.classListSelect(System.effects, this.effect);
		
		// ticker span
		if(!(this.e.tick instanceof Element)){
			this.e.tick = $.createElement('span');
			this.e.tick.classList.add('ticker');
			this.e.div.appendChild(this.e.tick);
		}
		this.e.tick.innerText = this.ticker;
		
		// locked icon
		if(!(this.e.lock instanceof Element)){
			this.e.lock = $.createElement('img');
			this.e.lock.src = 'img/icon/locked.png';
			this.e.div.appendChild(this.e.lock);
		}
		
		// characters list
		if(!(this.e.chars instanceof Element)){
			this.e.chars = $.createElement('ul');
		}
		this.e.div.appendChild(this.e.chars);
		if(f) {
			this.chain.e.section.appendChild(this.e.div);
			this.chain.jsPlumbInstance.draggable(this.e.div);
		}
		
		this.endpoint = this.chain.jsPlumbInstance.addEndpoint(
			this.e.div, {
				anchor:'Right',
				endpoint: [ "Dot", { radius: 5, cssClass: "endpoint" } ],
				type:'round',
				isSource:true,
				isTarget:true,
				connectionType:'wh'
			}
		);
	//	this.chain.jsPlumbInstance.revalidate(this.e.div);
	}
	drawToSystem(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToSystem());
			return;
		}
		$.getId('system_name').innerText = this.systemName;
		$.getId('system_constellation').innerText = this.constellationName;
		$.getId('system_region').innerText = this.regionName;
		$.getId('system_dotlan').href = 'http://evemaps.dotlan.net/system/'+this.systemName;
		$.getId('system_pasta').href = 'http://wh.pasta.gg/'+this.systemName;
		$.getId('system_zkill').href = 'https://zkillboard.com/system/'+this.systemID+'/';
		
		$.getId('system_ticker').href = 'https://zkillboard.com/search/'+this.ticker+'/';
		$.getId('system_corpticker').value = this.ticker;
		
		let e = $.getId('system_statussel');
		if(e.length == 0)
			e.populate(System.occupancies);
		
		e.classListSelect(System.occupancies, System.occupancies[this.occupancy]);
		
		e.selectedIndex = this.occupancy-1;
		
		$.getId('system_effect').innerText = (this.effect != 'none')? this.effect : ' none ';
		$.getId('system_effect').classListSelect(System.effects, this.effect);
		
		$.getId('system_security').innerText = this.classification;
		$.getId('system_security').classListSelect(System.classifications, this.classification);
		
		$.getId('system_description').innerText = this.description;
		
		let statics = '';
		for(let i = 0; i < this.statics.length; i++){
			let st = Signature.types[this.classification]['Wormhole'][this.statics[i]];
			if(!st)
				st = [this.statics[i],'unknown',3];
			statics += '<li><span>'+st[0]+'</span><a class="'+st[1]+'">'+st[1]+'</a></li>';
		}		
		$.getId('system_statics').innerHTML = statics;
	}
	drawToSignature(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToSignature());
			return;
		}
		if(! (this.e.sig instanceof Element)){
			this.e.sig = $.createElement('tbody');
			this.e.sig.id = 'signaturesTbody';
		}
		for(let i in this)
			if(this[i] instanceof Signature)
				this[i].drawToSignature();
	}
	getSignatureByName(s){
		for(let i in this)
			if(this[i].signatureName == s)
				return this[i];
	}
	setCurrent(b = true){
		if(b){
			if(document.readyState == 'loading'){
				window.addEventListener('DOMContentLoaded',(b) => this.setCurrent(b));
				return;
			}
			if(this.chain.selectedSystem instanceof System)
				this.chain.selectedSystem.setCurrent(0);
			this.chain.selectedSystem = this;
			this.e.div.classList.add('selected');
			
			SignaturePanel.show();
			let tbody = $.getId('signaturesTbody');
			tbody.parentNode.replaceChild(this.e.sig, tbody);
		
			SystemPanel.show();
			this.drawToSystem();
			
			Updater.requestUpdate();
			return;
		}
		if(this.e.div instanceof Element)
			this.e.div.classList.remove('selected');
	}
	setRemove(){
		if(!confirm("Are you sure you want to delete this system?"))
			return;
		this.active = 0;
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			undefined,
			'DELETE'
		);
		for(let i in this.chain.connections){
			let con = this.chain.connections[i];
			if(con.sourceSystemID == this.systemID || con.targetSystemID == this.systemID){
				con.setRemove();
			}
		}
		this.destructor();
	}
	setAlias(s){
		this.alias = s;
		this.drawToChain();
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{'alias' : this.alias},
			'POST'
		);
	}
	setLocked(b){
		this.locked = b;
		this.chain.jsPlumbInstance.setDraggable(this.e.div, !b);
		this.drawToChain();
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{locked : (this.locked? 1:0)},
			'POST'
		);
	}
	setRally(b){
		this.rally = b;
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{rally : (this.rally? 1:0)},
			'POST'
		);
	}
	setOccupancy(id){
		let e = $.getId('system_statussel');
		e.classList.remove(System.occupancies[this.occupancy]);
		e.classList.add(System.occupancies[id]);
		this.occupancy = id;
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{occupancy : this.occupancy},
			'POST'
		);
	}
	setDescription(s){
		this.description = s;
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{description : this.description},
			'POST'
		);
	}
	setTicker(s){
		this.ticker = s;
		$.getId('system_ticker').href = 'https://zkillboard.com/search/'+this.ticker+'/';
		this.drawToChain();
		this.chain.jsPlumbInstance.repaintEverything();
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{ticker : this.ticker},
			'POST'
		);
	}
	setPosition(x,y){
		this.posX = x;
		this.posY = y;
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/systems/'+this.systemID+'/',
			undefined,
			{posX : this.posX, posY : this.posY},
			'POST'
		);
	}
}


// @TODO: reverse this and store numbers in DB
System.classifications = {
	N:0,
	L:1,
	H:2,
	C1:3,
	C2:4,
	C3:5,
	C4:6,
	C5:7,
	C6:8,
	SH:9
};
// @TODO: reverse this and store numbers in DB
System.effects = {
	none:0,
	magnetar:1,
	redGiant:2,
	pulsar:3,
	wolfRayet:4,
	cataclysmic:5,
	blackHole:6
};
System.occupancies = {
	1:'unknown',
	2:'friendly',
	3:'occupied',
	4:'hostile',
	5:'empty',
	6:'unscanned'
};
