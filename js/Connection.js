
"use strict";

window.Connections = new Map();
class Connection extends Thing {
	
	constructor(p = {}){
		super();
	
		// hi_connection
		this.chainID = 0;
		this.connectionID = 0;
		this.sourceSystemID = 0;
		this.targetSystemID = 0;
		this.sourceSignatureID = '';
		this.targetSignatureID = '';
		this.wormholeID = 0;
		this.active = 1;
		this.eolUpdated = '';
		this.created = '';
		this.updated = '';
		
		// wormhole
		this.wormholeName = '';
		this.classification = '';
		this.massTotal = '';
		this.maxStableTime = '';
		
		this.scope = '';
		this.type = '';
		
		// database pulled from wormhole properties
		
		// local properties
		this.chain = Chains[p.chainID];
		this.connection = null;
		this.types = [];
		this.eol = (p.eolUpdated?1:0);
		this.frigate = 0;
		
		this.sourceSystem = null;
		this.sourceSignatureID = null;
		this.sourceEndpoint = null;
		
		this.targetSystem = null;
		this.targetSignatureID = null;
		this.targetEndpoint = null;
		
		this.update(p);
		this.chain.connections[p.connectionID] = this;
		Connections[p.connectionID] = this;
	}
	destructor(){
		this.chain.jsPlumbInstance.deleteEndpoint(this.sourceEndpoint);
		this.chain.jsPlumbInstance.deleteEndpoint(this.targetEndpoint);
		delete Connections[this.connectionID];
		delete this.chain[this.connectionID];
	}
	
	other(system){
		if(system == this.sourceSystem)
			return this.targetSystem;
		if(system == this.targetSystem)
			return this.sourceSystem;
		throw new Error();
	}
	draw(){
		this.drawToChain();
	}
	drawToChain(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToChain());
			return;
		}
		if(!	(this.sourceSystem instanceof System)
		||!	(this.targetSystem instanceof System)
		){
			throw new Error();
		}
		let instance = this.chain.jsPlumbInstance;
		let o = {};
		for(let i = 0; i < this.types.length; i++){
				if(this.types[i] == 'frigate')
					this.frigate = 1;
				Object.assign(o, Connection.plumbs[this.types[i]]);
		}
		if(!this.sourceEndpoint){
			this.sourceEndpoint = instance.addEndpoint(
				this.sourceSystem.e.div, {
					anchor:'Continuous',
					endpoint: [ "Dot", { radius: 5, cssClass: "endpoint" } ],
					type:'round'
				}
			);
		}
		if(!this.targetEndpoint){
			this.targetEndpoint = instance.addEndpoint(
				this.targetSystem.e.div, {
					anchor:'Continuous',
					endpoint: [ "Dot", { radius: 5, cssClass: "endpoint" } ],
					type:'round'
				}
			);
		}
		if(!this.connection){
			this.connection = instance.connect({
				source:this.sourceEndpoint, 
				target:this.targetEndpoint,
				connector:[ "Bezier", { curviness:40, cssClass: 'connector' } ],
				type:'wh'
			});
			for(let i in this.types)
				this.connection.addType(this.types[i]);
			
			// bind the contextmenu and set it to go off first so it overrides the chain handler.
			this.connection.getConnector().path.parentNode.bind('contextmenu',(ev) => this.evContextmenu(ev), 1);
		}
		
		//@TODO: reduce to a more specific function
		this.chain.jsPlumbInstance.repaintEverything(); 
	}
	evContextmenu(ev){
		super.evContextmenu(ev);
		ConnectionContext.show(ev,this);
	}
	setEOL(b = true){
		if(Config.test)
			console.log(`${this.connectionID}.setEOL()`);
		this.eol = b?1:0;
		if(b){
			this.types = this.types.filter((t) => { return (t != 'wh_eol'); });
			this.types.push('wh_eol');
			this.connection.addType('wh_eol');
		}
		else {
			this.types = this.types.filter((t) => { return (t != 'wh_eol'); });
			this.connection.removeType('wh_eol');
		}
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			{'type' : JSON.stringify(this.types),'eolUpdated':1},
			'POST'
		);
	}
	setMassFresh(){
		if(Config.test)
			console.log(`${this.connectionID}.setMassFresh()`);
		this.types = this.types.filter((t) => { return (t != 'wh_critical' && t != 'wh_reduced' && t != 'wh_fresh'); });
		this.types.push('wh_fresh');
		
		this.connection.removeType('wh_critical');	
		this.connection.removeType('wh_reduced');
		this.connection.addType('wh_fresh');
		
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			{'type' : JSON.stringify(this.types)},
			'POST'
		);
	}
	setMassReduced(){
		if(Config.test)
			console.log(`${this.connectionID}.setMassReduced()`);
		this.types = this.types.filter((t) => { return (t != 'wh_critical' && t != 'wh_reduced' && t != 'wh_fresh'); });
		this.types.push('wh_reduced');
		
		this.connection.removeType('wh_critical');	
		this.connection.addType('wh_reduced');
		this.connection.removeType('wh_fresh');
		
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			{'type' : JSON.stringify(this.types)},
			'POST'
		);
	}
	setMassCritical(){
		if(Config.test)
			console.log(`${this.connectionID}.setMassCritical()`);
		this.types = this.types.filter((t) => { return (t != 'wh_critical' && t != 'wh_reduced' && t != 'wh_fresh'); });
		this.types.push('wh_critical');
		
		this.connection.addType('wh_critical');	
		this.connection.removeType('wh_reduced');
		this.connection.removeType('wh_fresh');
		
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			{'type' : JSON.stringify(this.types)},
			'POST'
		);
	}
	setFrigate(b = true){
		if(Config.test)
			console.log(`${this.connectionID}.setFrigate()`);
		if(b){
			this.types = this.types.filter((t) => { return (t != 'frigate'); });
			this.types.push('frigate');
			this.connection.addType('frigate');
		}
		else {
			this.types = this.types.filter((t) => { return (t != 'frigate'); });
			this.connection.removeType('frigate');
		}
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			{'type' : JSON.stringify(this.types)},
			'POST'
		);
	}
	setGoalSave(){
		console.log('save mass on '+this.connectionID+' please');
	}
	setGoalCrit(){
		console.log('crit mass on '+this.connectionID+' please');	
	}
	setGoalRoll(){
		console.log('roll mass on '+this.connectionID+' please');	
	}
	setRemove(){
		this.destructor();
		Updater.fetch(
			'/v1/chains/'+this.chain.id+'/connections/'+this.connectionID+'/',
			undefined,
			undefined,
			'DELETE'
		);
	}
	update(p){
		
		// update any properties that have changed
		let f = false;
		let fcon = false;
		for(let i in p){
			if(this.hasOwnProperty(i)){
				if(i == 'created' || i == 'updated')
					p[i] = new Date(p[i]);
				if(this[i] != p[i] && i != 'created' && i != 'updated'){
					this[i] = p[i];
					f = true;
				}
			}
			else
				throw new Error('Connection.update(): '+i+' is not a property of Connection');
		}
		
		if(this.type.length > 2)
			this.types = JSON.parse(this.type);
		
		// find the matching systems
		let findHelper = function(chain, id){
			for(let i in chain.systems)
				if(chain.systems[i] instanceof System)
					if(chain.systems[i].systemID == id)
						return chain.systems[i];
			throw new Error();
		};
		try {
			if(!(this.sourceSystem instanceof System)){
				this.sourceSystem = findHelper(this.chain, this.sourceSystemID);
				fcon = true;
			}
			if(!(this.targetSystem instanceof System)){
				this.targetSystem = findHelper(this.chain, this.targetSystemID);
				fcon = true;
			}
		}
		catch(e){
			this.destructor();
			return;
		}
			
		// redraw if there have been any changes
		if(f) {
			if(Config.test)
				console.log('Connection.update()\'d = '+this.connectionID);
			super.draw();
			this.draw();
		}
		if(fcon && Config.test)
			console.log('Connection.update() connected '+this.connectionID);
	}
}

Connection.scopes = {
	wh:1,
	stargate:2,
	jumpbridge:3
};
Connection.types = {
	wh_fresh:1,
	wh_reduced:2,
	wh_critical:3,
	wh_eol:4
};
Connection.connections = {
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
		overlays: [  [ "Label", { 'label':"frig", 'location':0.5, 'cssClass':'overlay frigate' } ] ]
	}
};
Connection.endpoints = {
	"round": {
		isSource:true,
		isTarget:true,
		connectionType:'wh',
		endpointStyle : { stroke:'#777', strokeWidth:2, fill : "#456", dashstyle: '0' }
	}
};
Connection.plumbs = {
	jumpbridge: {
		connector: [ 
			"Straight", { 
				stub: [5, 5], 
				gap: 0 
			} 
		],
		paintStyle: {
			dashstyle: '4 2 1 2'
		}
	},
	stargate: {
		connector: [
			"Flowchart", { 
				stub: [20, 20],
				alwaysRespectStubs:true,
				cornerRadius: 10
			}
		]
	},
	frigate: {
		paintStyle: {
			dashStyle: '0.90'
		},
		connectorStyle: {
			strokeWidth:3,
			outlineWidth:2,
			stroke:'#447',
			outlineStroke:'#777'
		},
		connectorOverlays:[
			['Label', {
				label: '[F]',
				cssClass: ['overlay', 'frigate'].join(' '),
				location: 0.5
			}]
		]
	},
	preserve_mass: {
		connectorOverlays:[
			['Label', {
				label: 'save mass',
				cssClass: ['overlay', 'preserve'].join(' '),
				location: 0.5
			}]
		]
	},
	crit_mass: {
		connectorOverlays:[
			['Label', {
				label: 'crit this',
				cssClass: ['overlay', 'crit'].join(' '),
				location: 0.5
			}]
		]
	},
	roll: {
		connectorOverlays:[
			['Label', {
				label: 'roll this',
				cssClass: ['overlay', 'roll'].join(' '),
				location: 0.5
			}]
		]
	}
};