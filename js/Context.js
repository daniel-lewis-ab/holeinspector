
"use strict";

/*
	constructor() is called when the Class is instanciated.
	It binds draw() as soon as the HTML document is ready.
	draw() then binds the HTML and events.
	show() is called by the contextmenu event handler.
	show() displays the context menu.
	evHandlers() process events from the context menu.
*/

class __ChainContext {
	constructor(){
		this.e = {};
		this.chain = null;
		if(document.readyState === "complete")
			this.draw();
		else
			window.addEventListener('DOMContentLoaded',() => this.draw());
	}
	draw(){
		this.e.nav = $.getId('chainContext');
		this.e.ul = $.querySelector('#chainContext ul');
		this.e.name = $.getId('chainContext_name');
		this.e.addSubmit = $.getId('chainContext_addSubmit');
		this.e.systemName = $.getId('chainContext_systemName');
		
		this.e.nav.bind('mouseleave',(ev) => this.hide(ev));
		this.e.addSubmit.bind('click',(ev) => this.evAddSubmitClick(ev));
	}
	hide(){
		this.e.nav.style.display = 'none';
	}
	show(ev, chain){
		this.chain = chain;
		this.e.name.innerText = this.chain.name;
		this.e.nav.style.left = (ev.clientX-60)+'px';
		this.e.nav.style.top = (ev.clientY-80)+'px';
		this.e.nav.style.display = 'block';
	}
	evAddSubmitClick(ev){
		this.chain.addSystem( this.e.systemName.value , ev.clientX-80, ev.clientY-60 );
	}
}

class __SystemContext {
	constructor(){
		this.e = {};
		this.system = null;
		if(document.readyState === "complete")
			this.draw();
		else
			window.addEventListener('DOMContentLoaded',() => this.draw());
	}
	draw(){
		this.e.nav = $.getId('systemContext');
		this.e.ul = $.querySelector('#systemContext ul');
		this.e.name = $.getId('systemContext_name');
		this.e.lock = $.getId('systemContext_lock');
		this.e.rally = $.getId('systemContext_rally');
		this.e.remove = $.getId('systemContext_remove');
		
		this.e.nav.bind('mouseleave',(ev) => this.hide(ev));
		this.e.lock.bind('click',(ev) => this.evLock(ev));
		this.e.rally.bind('click',(ev) => this.evRally(ev));
		this.e.remove.bind('click',(ev) => this.evRemove(ev));
	}
	hide(){
		this.e.nav.style.display = 'none';
	}
	show(ev, system){
		this.system = system;
		this.e.name.innerText = this.system.systemName;
		this.e.lock.innerText = (this.system.locked? 'Unlock' : 'Lock');
		this.e.rally.innerText = (this.system.rally? 'Unrally' : 'Rally');
		this.e.nav.style.left = (ev.clientX-60)+'px';
		this.e.nav.style.top = (ev.clientY-80)+'px';
		this.e.nav.style.display = 'block';
	}
	evLock(ev){
		this.system.setLocked( (this.system.locked?0:1) );
		this.e.lock.innerText = (this.system.locked? 'Unlock' : 'Lock');
	}
	evRally(ev){
		this.system.setRally( (this.system.rally?0:1) );
		this.e.rally.innerText = (this.system.rally? 'Unrally' : 'Rally');
	}
	evRemove(ev){
		this.system.setRemove();
	}
}

class __ConnectionContext {
	constructor(){
		this.e = {};
		this.connection = null;
		if(document.readyState === "complete")
			this.draw();
		else
			window.addEventListener('DOMContentLoaded',() => this.draw());
	}
	draw(){
		this.e.nav = $.getId('connectionContext');
		this.e.ul = $.querySelector('#connectionContext ul');
		this.e.id = $.getId('connectionContext_id');
		this.e.eol = $.getId('connectionContext_meol');
		this.e.fresh = $.getId('connectionContext_mfresh');
		this.e.reduced = $.getId('connectionContext_mreduced');
		this.e.critical = $.getId('connectionContext_mcritical');
		this.e.frigate = $.getId('connectionContext_mfrigate');
		this.e.save = $.getId('connectionContext_psave');
		this.e.crit = $.getId('connectionContext_pcrit');
		this.e.roll = $.getId('connectionContext_proll');
		this.e.remove = $.getId('connectionContext_remove');
		
		this.e.nav.bind('mouseleave',(ev) => this.hide(ev));
		this.e.eol.bind('click',(ev) => this.evEOL(ev));
		this.e.fresh.bind('click',(ev) => this.evFresh(ev));
		this.e.reduced.bind('click',(ev) => this.evReduced(ev));
		this.e.critical.bind('click',(ev) => this.evCritical(ev));
		this.e.frigate.bind('click',(ev) => this.evFrigate(ev));
		this.e.save.bind('click',(ev) => this.evSave(ev));
		this.e.crit.bind('click',(ev) => this.evCrit(ev));
		this.e.roll.bind('click',(ev) => this.evRoll(ev));
		this.e.remove.bind('click',(ev) => this.evRemove(ev));
	}
	hide(){
		this.e.nav.style.display = 'none';
	}
	show(ev, connection){
		this.connection = connection;
		this.e.id.innerText = this.connection.connectionID;
	
		this.e.eol.innerText = (this.connection.eol? 'Not EOL' : 'Set EOL');
		this.e.frigate.innerText = (this.connection.frigate? 'Not Frigate' : 'Set Frigate');
		
		this.e.nav.style.left = (ev.clientX-60)+'px';
		this.e.nav.style.top = (ev.clientY-80)+'px';
		this.e.nav.style.display = 'block';
	}
	evEOL(ev){
		this.e.eol.innerText = (this.connection.eol? 'Not EOL' : 'Set EOL');
		this.connection.setEOL(!this.connection.eol);
	}
	evFresh(ev){
		this.connection.setMassFresh();
	}
	evReduced(ev){
		this.connection.setMassReduced();
	}
	evCritical(ev){
		this.connection.setMassCritical();
	}
	evFrigate(ev){
		this.e.frigate.innerText = (this.connection.frigate? 'Not Frigate' : 'Set Frigate');
		this.connection.setFrigate(!this.connection.frigate);
	}
	evSave(ev){
		this.connection.setGoalSave();
	}
	evCrit(ev){
		this.connection.setGoalCrit();
	}
	evRoll(ev){
		this.connection.setGoalRoll();
	}
	evRemove(ev){
		this.connection.setRemove();
	}
}


window.ChainContext = new __ChainContext();
window.SystemContext = new __SystemContext();
window.ConnectionContext = new __ConnectionContext();

