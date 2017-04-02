
"use strict";

window.Chains = {};
Chains.current;
class Chain extends Thing {
	constructor(p = {}){
		super();
		
		this.id = 0;
		this.created = new Date();
		this.updated = new Date();
		this.active = 1;
		this.scope = '';
		this.type = '';
		this.name = '';
		this.clean = 1;
		
		this.selectedSystem = null;
		
		this.systems = {};
		this.connections = {};
		this.characters = {};
		
		this.e = {};
		this.e.tab = null;
		this.e.section = null;
		this.jsPlumbInstance = null;
		
		this.update(p);
		Chains[this.id] = this;
	}
	destructor(){
		this.undraw();
		delete Chains[this.id];
	}
	draw(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.draw());
			return;
		}
		if(Config.test)
			console.log(this.name+'.draw()');
		
		if(! (this.e.tab instanceof Tab)){
			this.e.tab = new Tab(ChainPanel, this.name);
			this.e.tab.li.classList.add(this.type);
			this.e.tab.a.addEventListener('click',(ev) => this.setCurrent(ev));
		}
		if(! (this.e.section instanceof Element)){
			this.e.section = this.e.tab.section;
			this.e.section.id = this.name;
			this.e.section.classList.add('chain');
			this.e.section.bind('contextmenu',(ev) => this.evContextmenu(ev));
		}		
		// bind jsPlumb
		if(!this.jsPlumbInstance)
			this.startJSPlumb();
	}
	getSystemByName(s){
		for(let i in this)
			if(this[i] instanceof System && this[i].name == s)
				return this[i];
	}
	setCurrent(b = true){
		if(b){
			if(Config.test)
				console.log('Chain.id = '+this.id+' was setCurrent()');
			if(Chains.current instanceof Chain)
				Chains.current.setCurrent(0);
			Chains.current = this;
			Updater.setPoll();
		}
	}
	startJSPlumb(){
		this.jsPlumbInstance = jsPlumb.getInstance();
		if(!(this.e.section instanceof Element))
			throw new Error();
		this.jsPlumbInstance.setContainer(this.e.section.id);
		this.jsPlumbInstance.registerConnectionTypes({
			"wh": {
				paintStyle: { stroke:'#444', strokeWidth:3, outlineStroke:'#777', outlineWidth:2, 'stroke-dasharray':'none', 'stroke-linecap':'none' },
				connectorStyle: { strokeWidth:3, outlineWidth:2, 'stroke-linecap':'none' }
			},
			"wh_fresh": {
				paintStyle: { stroke:'#444', strokeWidth:3, outlineStroke:'#777', outlineWidth:2 },
				hoverPaintStyle: { stroke:'#555', strokeWidth:3 }
			},
			"wh_eol": {
				paintStyle:{ outlineStroke:'rgb(215,71,214)', outlineWidth:2 }
			},
			"wh_reduced": {
				paintStyle:{ stroke:'#ca3', strokeWidth:3 }
			},
			"wh_critical": {
				paintStyle:{ stroke:'#f33', strokeWidth:3 }
			},
			"frigate": {
				paintStyle: { strokeWidth:4, 'stroke-dasharray':4, 'stroke-linecap':'round' },
				connectorStyle: { strokeWidth:4, outlineWidth:4, stroke:'#449', outlineStroke:'#779', 'stroke-linecap':'round' },
				overlays: [  [ "Label", { 'label':"frig", 'location':0.5, 'id':'overlay'+this.id, 'cssClass':'overlay frigate' } ] ]
			}
		});
		this.jsPlumbInstance.registerEndpointTypes({
			"round": {
				isSource:true,
				isTarget:true,
				connectionType:'wh',
				endpointStyle : { stroke:'#777', strokeWidth:2, fill : "#456", dashstyle: '0' }
			}
		});
		this.jsPlumbInstance.bind("connection", (info, ev) => this.evConnection(info, ev));
		this.jsPlumbInstance.bind("connectionDetached", (info, ev) => this.evConnectionDetached(info, ev));
		jsPlumb.fire("jsPlumbDemoLoaded", this.jsPlumbInstance);
	}
	evConnection(info,ev){ // jsPlumb event, doesn't have "this"
		if(ev)
			this.addConnection( info.source, info.target, ev );
	}
	evConnectionDetached(info,ev){ // jsPlumb event, doesn't have "this"
		console.log('remove connection');
	}
	evContextmenu(ev){
		if(ev.target != ev.currentTarget) // jsPlumb binds everything to the chain, so we need to filter this
			return;
		
		super.evContextmenu(ev);
		ChainContext.show(ev, this);
	}
	addConnection(se, te, ev){
		let source;
		let target;
		let ksec = {'H':1,'L':1,'N':1};
			
		// which System owns se and te, we need it's id property.
		for(let i in this.systems){
			let sys = this.systems[i];
			if(sys.e.div == se){
				source = sys;
				continue;
			}
			if(sys.e.div == te)
				target = sys;
		}
		if(!source || !target){
			console.log('element not found?');
			return;
		}
		if(!ev && source.classification in ksec && target.classification in ksec){
			console.log('both systems are in k space.  don\'t connect');
			return;
		}		
		Updater.fetch(
			'/v1/chains/'+this.id+'/connections/add/',
			undefined,
			{
				'sourceSystemID' : source.systemID,
				'targetSystemID' : target.systemID
			},
			'POST'
		);
	}
	addSystem(n, posX, posY){
		let p = {
			'posX' : posX,
			'posY' : posY
		};
		Updater.fetch(
			'/v1/chains/'+this.id+'/systems/'+n+'/add/',
			undefined,
			p,
			'POST'
		);
	}
}

window.addEventListener('load',(ev) => {
	ChainPanel.add = new Tab(ChainPanel, '+');
	ChainPanel.add.populateEdits = function(){
		let sel = $.getId('chain_select_name');
		for(let i in Chains){
			if(i == 'current') continue;
			let o = $.createElement('option');
			o.innerText = Chains[i].name;
			o.value = i;
			sel.appendChild(o);
		}
	};
	ChainPanel.add.a.addEventListener('click',ChainPanel.add.populateEdits);
});