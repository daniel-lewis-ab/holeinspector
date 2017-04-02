
"use strict";

window.Signatures = {};
class Signature extends Thing {
	
	constructor(p = {}) {
		super();

		// `hi_signature`
		this.chainID = 0;
		this.systemID = 0;
		this.signatureID = 0;
		this.name = '';
		this.active = 1;
		this.state = '';
		this.type = 0;
		this.subtype = 0;
		this.description = '';
		this.found = 0;
		this.updated = 0;
		this.foundByCharacterID = 0;
		this.updatedByCharacterID = 0;
	
		// local properties
		this.connectTo = null;
		
		this.chain = Chains[p.chainID];
		this.system = this.chain.systems[p.systemID];
		this.e = {};
		
		this.e.tr = null;
		this.e.name = null;
		this.e.group = null;
		this.e.typeO = null;
		this.e.state = null;
		this.e.resources = null;
		this.e.description = null;
		this.e.found = null;
		this.e.updated = null;
		this.e.close = null;
		
		// (re)construct
		this.update(p);
		this.system.signatures[this.signatureID] = this;
		Signatures[this.signatureID] = this;
	}
	destructor() {
		this.undraw();
		Signatures[this.signatureID] = null;
		this.system.signatures[this.signatureID] = null;
	}

	draw(){
		this.drawToSignature();
	}
	undraw(){
		super.undraw();
	}
	
	drawToSignature() {
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawToSignature());
			return;
		}
		let sec = this.system.classification;
		let group = Signature.groups[this.type];
		let s = '';
		let i;
		
		if(!(this.e.tr instanceof Element)){
			this.e.tr = $.createElement('tr');
			this.e.tr.name = this.signatureID;
			this.system.e.sig.appendChild(this.e.tr);
		}
		
		if(!(this.e.name instanceof Element)){
			this.e.name = $.createElement('td');
			this.e.tr.appendChild(this.e.name);
		}
		this.e.name.innerHTML = '<input value="'+this.name+'" maxlength="3" size="3" onblur="Chains['+this.chainID+'].systems['+this.systemID+'].signatures[\''+this.signatureID+'\'].setName(this.value);">';
		
		if(!(this.e.group instanceof Element)){
			this.e.group = $.createElement('td');
			this.e.tr.appendChild(this.e.group);
		}
		s = '';
		for(i = 0; i < Object.keys(Signature.groups).length; i++){
			s+= '<option value="'+i+'"'+(this.type == i?' selected':'')+'>'+(Signature.groups[i]||'&nbsp;')+'</option>';
		}
		this.e.group.innerHTML = '<select onchange="Chains['+this.chainID+'].systems['+this.systemID+'].signatures[\''+this.signatureID+'\'].setGroupId(this.value);">'+s+'</select>';
		
		
		if(!(this.e.typeO instanceof Element)){
			this.e.typeO = $.createElement('td');
			this.e.tr.appendChild(this.e.typeO);
		}
		s = '';
		if(this.system instanceof System && this.type){
			let n = 1;
			if(this.type == 5){
				
				// Ripped out and manually added all the WH types
				// Needs verification
				for(i in Signature.types[sec][group]){ 
					let hole = Signature.types[sec][group][i];
					
					if(hole[2] != 3) // except statics
						s += '<option value="'+i+'"'+(this.subtype == i?' selected':'')+'>'+hole[0]+' - '+hole[1]+'</option>';
				}
				for(i in this.system.statics){
					let hole = Signature.types[sec][group][this.system.statics[i]];
					if(!hole)
						hole = [this.system.statics[i], 'unknown', 3];
					s += '<option value="'+this.system.statics[i]+'"'+(this.subtype == this.system.statics[i]?' selected':'')+'>'+hole[0]+' - '+hole[1]+'</option>';
				}
			}
			else {
				for(i in Signature.types[sec][group]){
					s += '<option value="'+i+'"'+(this.subtype == i?' selected':'')+'>'+(Signature.types[sec][group][i]||'&nbsp;')+'</option>';
				}
			}
		}
		this.e.typeO.innerHTML = '<select onchange="Chains['+this.chainID+'].systems['+this.systemID+'].signatures[\''+this.signatureID+'\'].setTypeId(this.value);">'+s+'</select>';
		
		if(!(this.e.state instanceof Element)){
			this.e.state = $.createElement('td');
			this.e.tr.appendChild(this.e.state);
		}
		s = '';
		if(this.system instanceof System && group){
			let state = Signature.states[group][this.state];
			if(!state)
				state = '';
			for(i = 0; i < Object.keys(Signature.states[Signature.groups[this.type]]).length; i++){
				s+= '<option value="'+i+'"'+(this.stateId == i?' selected':'')+'>'+(Signature.states[Signature.groups[this.type]][i]||'&nbsp;')+'</option>';
			}
		}
		this.e.state.innerHTML = '<select onchange="Chains['+this.chainID+'].systems['+this.systemID+'].signatures[\''+this.signatureID+'\'].setState(this.value);">'+s+'</select>';
		
		if(!(this.e.resources instanceof Element)){
			this.e.resources = $.createElement('td');
			this.e.tr.appendChild(this.e.resources);
		}
		
		switch(this.type){
			case 1:
			case 2:
			case 3:
				// @TODO: Provide information from Rykki's Guide directly
				s = '<a target="blank" href="https://docs.google.com/spreadsheets/d/17cNu8hxqJKqkkPnhDlIuJY-IT6ps7kTNCd3BEz0Bvqs/edit#gid=';
				switch(this.system.security){
					case 'C1': this.e.resources.innerHTML = s+'2001647085">Rykki\'s Guide</a>'; break;
					case 'C2': this.e.resources.innerHTML = s+'981953365">Rykki\'s Guide</a>'; break;
					case 'C3': this.e.resources.innerHTML = s+'0">Rykki\'s Guide</a>'; break;
					case 'C4': this.e.resources.innerHTML = s+'816437863">Rykki\'s Guide</a>'; break;
					case 'C5': this.e.resources.innerHTML = s+'236665847">Rykki\'s Guide</a>'; break;
					case 'C6': this.e.resources.innerHTML = s+'26134341">Rykki\'s Guide</a>'; break;
				}
				break;
			case 4:
				this.e.resources.innerHTML = '<a target="blank" href="https://docs.google.com/spreadsheets/d/17cNu8hxqJKqkkPnhDlIuJY-IT6ps7kTNCd3BEz0Bvqs/edit#gid=265585191">Rykki\'s Guide</a>';
				break;
			case 5:
				// @TODO: Provide wormhole mass calculation features
				if(this.connectTo instanceof Connection){
					this.e.resources.innerHTML += '<a>to:'+this.connectTo.other(this).name+'</a> ';
					this.e.resources.innerHTML += '<a>mass:'+this.connectTo.massRemaining+'kg</a>';
				}
				break;
			case 6:
				this.e.resources.innerHTML = '<a target="blank" href="https://docs.google.com/spreadsheets/d/17cNu8hxqJKqkkPnhDlIuJY-IT6ps7kTNCd3BEz0Bvqs/edit#gid=1334578207">Rykki\'s Guide</a>';
				break;
		}
		
		if(!(this.e.description instanceof Element)){
			this.e.description = $.createElement('td');
			this.e.tr.appendChild(this.e.description);
		}
		this.e.description.innerText = this.description;
		
		if(!(this.e.found instanceof Element)){
			this.e.found = $.createElement('td');
			this.e.tr.appendChild(this.e.found);
		}
		if(this.found instanceof Date)
			this.e.found.innerText = this.found.getUTCDateTime();
		
		if(!(this.e.updated instanceof Element)){
			this.e.updated = $.createElement('td');
			this.e.tr.appendChild(this.e.updated);
		}
		if(this.updated instanceof Date)
			this.e.updated.innerText = this.updated.getUTCDateTime();
		
		if(!(this.e.close instanceof Element)){
			this.e.close = $.createElement('td');
			this.e.tr.appendChild(this.e.close);
		}
		this.e.close.innerHTML = '<a class="close" onclick="Chains[\''+this.chainID+'\'].systems[\''+this.systemID+'\'].signatures[\''+this.signatureID+'\'].setRemove()">x</a>';
	}

	setRemove() {
		this.destructor();
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			undefined,
			'DELETE'
		);
	}
	setName(s) {
		this.name = s;
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			{'name': this.name},
			'POST'
		);
	}
	setGroupId(n) {
		this.type = n;
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			{'type' : this.type},
			'POST'
		);
		// @TODO: recalculate subtype
	}
	setTypeId(n){
		this.subtype = n;
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			{'subtype' : this.subtype},
			'POST'
		);
	}
	setState(n){
		this.state = n;
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			{'state' : this.state},
			'POST'
		);
	}
	setDescription(s){
		this.description = s;
		Updater.fetch(
			'/v1/chains/'+this.chainID+'/systems/'+this.systemID+'/signatures/'+this.signatureID+'/',
			undefined,
			{'description' : this.description},
			'POST'
		);
	}
	
	static add(p = {}){
		// method is now to cause server to create the sig, and wait for it to come back with an ID along with the changes
		// @warning: `this` doesn't exist for statics!
		Updater.fetch(
			'/v1/chains/'+Chains.current.id+'/systems/'+Chains.current.selectedSystem.systemID+'/signatures/add/',
			undefined,
			p,
			'POST'
		);
	}
	static scan(s){
		// @TODO: convert this to run off this.system.chain so it can be used other than through HTML
		if(	!(Chains.current instanceof Chain) 
		||	!(Chains.current.selectedSystem instanceof System)
		){
			return;
		}
		var sys = Chains.current.selectedSystem;
			
		var sigs = s.split(/\r?\n/);
		var sig;
		var p;
		var n;
		var j;
		for(var i = 0; i < sigs.length; i++){
			if(!sigs[0].length)
				continue;
			p = {};
			p.chainID = sys.chain.id;
			p.systemID = sys.systemID;
			p.active = 1;
			sig = sigs[i].split(/\t/);
			p.name = sig[0].slice(0,3);
			if(sig.length >= 2){
				let group = sig[2].replace(' Site','');
				group = Object.flipMap(Signature.groups)[group];
				if(group instanceof Number && group > 0)
					p.type = group;
			}
			
			//@TODO:	p.subtype = sig[3]; // expects a Number b/c that's what the database offers, need to flipMap, but it's 3 deep?
			
			n = sys.signatures[p.signatureID];
			if(n instanceof Signature){
				for(j in p){
					if(n[j] != p[j]){
						p.updated = new Date();
						n.update(p);
					}
				}
			}
			else {
				Signature.add(p);
			//	n = new Signature(p);
			}
		}
	}
}

window.addEventListener('DOMContentLoaded',function(){

	$.getId('signaturepost').bind('focus',function(e){
		e.currentTarget.value = '';
	});
	$.getId('signaturepost').bind('blur',function(e){
		Signature.scan(e.currentTarget.value);
		e.currentTarget.value = 'paste signatures here';
	});
	$.getId('addSignature').bind('click',function(e){
		Signature.add();
	});
});

Signature.groups = {
	0:'',
	1:'Combat',
	2:'Relic',
	3:'Data',
	4:'Gas',
	5:'Wormhole',
	6:'Ore',
	7:'Ghost'
};
Signature.states = {
	Combat:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Looted',
		5:'Salvaged'
	},
	Relic:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Hacked',
		5:'Looted',
		6:'Salvaged'
	},
	Data:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Hacked',
		5:'Looted',
		6:'Salvaged'
	},
	Gas:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Looted',
		5:'Empty'
	},
	Wormhole:{
		0:'',
		1:'Fresh',
		2:'Reduced',
		3:'Critical',
		4:'Closed'
	},
	Ore:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Looted',
		5:'Empty'
	},
	Ghost:{
		0:'',
		1:'Triggered',
		2:'Active',
		3:'Cleared',
		4:'Looted',
		5:'Salvaged'
	}
};
Signature.types = {
	C1: {
		Combat:{
			0:'',
			1:'Perimeter Ambush Point',
			2:'Perimeter Camp',
			3:'Phase Catalyst Node',
			4:'The Line'
		},
		Relic:{
			// clone N.Relic
			0:'',
			1:'Forgotten Perimeter Coronation Platform',
			2:'Forgotten Perimeter Power Array'
		},
		Data:{
			// clone N.Data
			0:'',
			1: 'Unsecured Perimeter Amplifier',
			2: 'Unsecured Perimeter Information Center'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Token Perimeter Reservoir',
			3: 'Minor Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Ordinary Perimeter Reservoir'
		},
		Wormhole:{
			// WANDERING
			24: ['H121','C1',0],
			10: ['C125','C2',0],
			48: ['O883','C3',0],
			37: ['M609','C4',0],
			33: ['L614','C5',0],
			57: ['S804','C6',0],
			84: ['F135','Thera',0],
			
			// STATIC
			39:['N110','H',3],
			28:['J244','L',3],
			72:['Z060','N',3]
		},
		Ore:{
			0: '',
			1: 'Ordinary Perimeter Deposit',
			2: 'Common Perimeter Deposit',
			3: 'Unexceptional Frontier Deposit',
			4: 'Average Frontier Deposit',
			5: 'Isolated Core Deposit',
			6: 'Uncommon Core Deposit'
                },
		Ghost:{
		}
	},
	C2:{
		Combat:{
			0:'',
			1: 'Perimeter Checkpoint',
			2: 'Perimeter Hangar',
			3: 'The Ruins of Enclave Cohort 27',
			4: 'Sleeper Data Sanctuary'
		},
		Relic:{
			// clone N.Relic
			0:'',
			1: 'Forgotten Perimeter Gateway',
			2: 'Forgotten Perimeter Habitation CoiL'
		},
		Data:{
			// clone N.Data
			0:'',
			1: 'Unsecured Perimeter Comms Relay',
			2: 'Unsecured Perimeter Transponder Farm'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Token Perimeter Reservoir',
			3: 'Minor Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Ordinary Perimeter Reservoir'
		},
		Wormhole:{
			// WANDERING
			75: ['Z647','C1',0],
			16: ['D382','C2',0],
			47: ['O477','C3',0],
			69: ['Y683','C4',0],
			38: ['N062','C5',0],
			53: ['R474','C6',0],
			84: ['F135','Thera',0],
			
			// STATIC
			75:['Z647','C1',3],
			16:['D382','C2',3],
			47:['O477','C3',3],
			69:['Y683','C4',3],
			38:['N062','C5',3],
			53:['R474','C6',3],
			6:['B274','H',3],
			2:['A239','L',3],
			21:['E545','N',3]
		},
		Ore:{
			0:'',
			1: 'Ordinary Perimeter Deposit',
			2: 'Common Perimeter Deposit',
			3: 'Unexceptional Frontier Deposit',
			4: 'Average Frontier Deposit',
			5: 'Isolated Core Deposit',
			6: 'Uncommon Core Deposit'
                },
		Ghost:{
		}
	},
	C3:{
		Combat:{
			0:'',
			1: 'Fortification Frontier Stronghold',
			2: 'Outpost Frontier Stronghold',
			3: 'Solar Cell',
			4: 'The Oruze Construct'
		},
		Relic:{
			// clone N.Relic
			0:'',
			1: 'Forgotten Frontier Quarantine Outpost',
			2: 'Forgotten Frontier Recursive Depot'
		},
		Data:{
			// clone N.Data
			0:'',
			1: 'Unsecured Frontier Database',
			2: 'Unsecured Frontier Receiver'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Token Perimeter Reservoir',
			3: 'Minor Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Ordinary Perimeter Reservoir',
			6: 'Bountiful Frontier Reservoir',
			7: 'Vast Frontier Reservoir'
		},
		Wormhole:{
			// WANDERING
			63: ['V301','C1',0],
			27: ['I182','C2',0],
			45: ['N968','C3',0],
			58: ['T405','C4',0],
			43: ['N770','C5',0],
			4: ['A982','C6',0],
			84: ['F135','Thera',0],
			
			// STATIC
			18:['D845','H',3],
			59:['U210','L',3],
			30:['K346','N',3]
		},
		Ore:{
			0:'',
			1: 'Ordinary Perimeter Deposit',
			2: 'Common Perimeter Deposit',
			3: 'Unexceptional Frontier Deposit',
			4: 'Average Frontier Deposit',
			5: 'Isolated Core Deposit',
			6: 'Uncommon Core Deposit'
                },
		Ghost:{
		}
	},
	C4:{
		Combat:{
			0:'',
			1: 'Frontier Barracks',
			2: 'Frontier Command Post',
			3: 'Integrated Terminus',
			4: 'Sleeper Information Sanctum'
		},
		Relic:{
			0:'',
			1: 'Forgotten Frontier Conversion Module',
			2: 'Forgotten Frontier Evacuation Center'
		},
		Data:{
			0:'',
			1: 'Unsecured Frontier Digital Nexus',
			2: 'Unsecured Frontier Trinary Hub'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Token Perimeter Reservoir',
			3: 'Minor Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Ordinary Perimeter Reservoir',
			6: 'Vast Frontier Reservoir',
			7: 'Bountiful Frontier Reservoir'
		},
		Wormhole:{
			// NO WANDERING
			
			// STATIC
			49:['P060','C1',3],
			42:['N766','C2',3],
			12:['C247','C3',3],
			68:['X877','C4',3],
			26:['H900','C5',3],
			61:['U574','C6',3],
		},
		Ore:{
			0:'',
			1: 'Ordinary Perimeter Deposit',
			2: 'Common Perimeter Deposit',
			3: 'Unexceptional Frontier Deposit',
			4: 'Average Frontier Deposit',
			5: 'Unusual Core Deposit',
			6: 'Infrequent Core Deposit'
                },
		Ghost:{
		}
	},
	C5:{
		Combat:{
			0:'',
			1: 'Core Garrison',
			2: 'Core Stronghold',
			3: 'Oruze Osobnyk',
			4: 'Quarantine Area'
		},
		Relic:{
			0:'',
			1: 'Forgotten Core Data Field',
			2: 'Forgotten Core Information Pen'
		},
		Data:{
			0:'',
			1: 'Unsecured Frontier Enclave Relay',
			2: 'Unsecured Frontier Server Bank'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Minor Perimeter Reservoir',
			3: 'Ordinary Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Token Perimeter Reservoir',
			6: 'Bountiful Frontier Reservoir',
			7: 'Vast Frontier Reservoir',
			8: 'Instrumental Core Reservoir',
			9: 'Vital Core Reservoir'
		},
		Wormhole:{
			// WANDERING
			17: ['D792','H',0],
			11: ['C140','L',0],
			73: ['Z142','N',0],
			84: ['F135','Thera',0],
			
			// STATIC
			70:['Y790','C1',3],
			15:['D364','C2',3],
			35:['M267','C3',3],
			20:['E175','C4',3],
			25:['H296','C5',3],
			64:['V753','C6',3],
			59:['U210','L',3], // specific to a handful of C5's
		},
		Ore:{
			0:'',
			1: 'Average Frontier Deposit',
			2: 'Unexceptional Frontier Deposit',
			3: 'Uncommon Core Deposit',
			4: 'Ordinary Perimeter Deposit',
			5: 'Common Perimeter Deposit',
			6: 'Exceptional Core Deposit',
			7: 'Infrequent Core Deposit',
			8: 'Unusual Core Deposit',
			9: 'Rarified Core Deposit',
			10: 'Isolated Core Deposit'
                },
		Ghost:{
		}
	},
	C6:{
		Combat:{
			0:'',
			1: 'Core Citadel',
			2: 'Core Bastion',
			3: 'Strange Energy Readings',
			4: 'The Mirror'
		},
		Relic:{
			0:'',
			1: 'Forgotten Core Assembly Hall',
			2: 'Forgotten Core Circuitry Disassembler'
		},
		Data:{
			0:'',
			1: 'Unsecured Core Backup Array',
			2: 'Unsecured Core Emergence'
		},
		Gas:{
			0:'',
			1: 'Barren Perimeter Reservoir',
			2: 'Minor Perimeter Reservoir',
			3: 'Ordinary Perimeter Reservoir',
			4: 'Sizeable Perimeter Reservoir',
			5: 'Token Perimeter Reservoir',
			6: 'Bountiful Frontier Reservoir',
			7: 'Vast Frontier Reservoir',
			8: 'Instrumental Core Reservoir',
			9: 'Vital Core Reservoir'
		},
		Wormhole:{
			// WANDERING
			17: ['D792','H',0],
			14: ['C391','L',0],
			13: ['C248','N',0],
			84: ['F135','Thera',0],
			
			// STATIC
			51:['Q317','C1',3],
			23:['G024','C2',3],
			32:['L477','C3',3],
			74:['Z457','C4',3],
			65:['V911','C5',3],
			66:['W237','C6',3],
			30:['K346','N',3] // specific to 2x C6's
		},
		Ore:{
			0:'',
			1: 'Ordinary Perimeter Deposit',
			2: 'Common Perimeter Deposit',
			3: 'Unexceptional Frontier Deposit',
			4: 'Average Frontier Deposit',
			5: 'Rarified Core Deposit'
                },
		Ghost:{
			0:'',
			1: 'Superior Blood Raider Covert Research Facility'
		}
	},
	SH:{
		Wormhole:{
			49: ['P060','C1',0],
			75: ['Z647','C1',0],
			16: ['D382','C2',0],
			31: ['L005','C2',0],
			42: ['N766','C2',0],
			12: ['C247','C3',0],
			35: ['M267','C3',0],
			47: ['O477','C3',0],
			68: ['X877','C4',0],
			69: ['Y683','C4',0],
			26: ['H900','C5',0],
			25: ['H296','C5',0],
			38: ['N062','C5',0],
			65: ['V911','C5',0],
			61: ['U574','C6',0],
			64: ['V753','C6',0],
			66: ['W237','C6',0],
			6: ['B274','H',0],
			17: ['D792','H',0],
			18: ['D845','H',0],
			39: ['N110','H',0],
			2: ['A239','L',0],
			14: ['C391','L',0],
			28: ['J244','L',0],
			59: ['U210','L',0],
			13: ['C248','N',0],
			21: ['E545','N',0],
			30: ['K346','N',0],
			72: ['Z060','N',0]
		},
	},
	H:{
		Wormhole:{
			76: ['Z971','C1',0],
			54: ['R943','C2',0],
			67: ['X702','C3',0],
			// no C4
			36: ['M555','C5',0],
			5: ['B041','C6',0],
			3: ['A641','H',0],
			52: ['R051','L',0],
			62: ['V283','N',0],
			85: ['T458','Thera',0]
		},
	},
	L:{
		Wormhole:{
			76: ['Z971','C1',0],
			54: ['R943','C2',0],
			67: ['X702','C3',0],
			// no C4
			41: ['N432','C5',0],
			60: ['U319','C6',0],
			7: ['B449','H',0],
			44: ['N944','L',0],
			56: ['S199','N',0],
			86: ['M164','Thera',0]
		},
	},
	N:{
		'Relic':{},
		'Data':{},
		Wormhole:{
			// WANDERING
			76: ['Z971','C1',0],
			54: ['R943','C2',0],
			67: ['X702','C3',0],
			// no C4
			41: ['N432','C5',0],
			60: ['U319','C6',0],
			7: ['B449','H',0],
			44: ['N944','L',0],
			56: ['S199','N',0],
			87: ['L031','Thera',0]
		},
	}
};
for( let i in {'C1':1,'C2':1,'C3':1,'N':1} ){
	Object.clone(Signature.types[i].Relic, {
		10: 'Ruined Angel Crystal Quarry',
		11: 'Ruined Angel Monument Site',
		12: 'Ruined Angel Science Outpost',
		13: 'Ruined Angel Temple Site',
		14: 'Ruined Blood Raider Crystal Quarry',
		15: 'Ruined Blood Raider Monument Site',
		16: 'Ruined Blood Raider Science Outpost',
		17: 'Ruined Blood Raider Temple Site',
		18: 'Ruined Guristas Crystal Quarry',
		19: 'Ruined Guristas Monument Site',
		20: 'Ruined Guristas Science Outpost',
		21: 'Ruined Guristas Temple Site',
		22: 'Ruined Sansha Crystal Quarry',
		23: 'Ruined Sansha Monument Site',
		24: 'Ruined Sansha Science Outpost',
		25: 'Ruined Sansha Temple Site',
		26: 'Ruined Serpentis Crystal Quarry',
		27: 'Ruined Serpentis Monument Site',
		28: 'Ruined Serpentis Science Outpost',
		29: 'Ruined Serpentis Temple Site'
	});
	Object.clone(Signature.types[i].Data, {
		10: 'Abandoned Research Complex DA005',
		11: 'Abandoned Research Complex DA015',
		12: 'Abandoned Research Complex DC007',
		13: 'Abandoned Research Complex DC021',
		14: 'Abandoned Research Complex DC035',
		15: 'Abandoned Research Complex DG003',
		16: 'Central Angel Command Center',
		17: 'Central Angel Data Mining Site',
		18: 'Central Angel Sparking Transmitter',
		19: 'Central Angel Survey Site',
		20: 'Central Blood Raider Command Center',
		21: 'Central Blood Raider Data Mining Site',
		22: 'Central Blood Raider Sparking Transmitter',
		23: 'Central Blood Raider Survey Site',
		24: 'Central Guristas Command Center',
		25: 'Central Guristas Data Mining Center',
		26: 'Central Guristas Sparking Transmitter',
		27: 'Central Guristas Survey Site',
		28: 'Central Sansha Command Center',
		29: 'Central Sansha Data Mining Site',
		30: 'Central Sansha Sparking Transmitter',
		31: 'Central Sansha Survey Site',
		32: 'Central Serpentis Command Center',
		33: 'Central Serpentis Data Mining Site',
		34: 'Central Serpentis Sparking Transmitter',
		35: 'Central Serpentis Survey Site'
	});
}
for( let i in {'C1':1,'C2':1,'C3':1,'C4':1,'C5':1,'C6':1,'SH':1,'H':1,'L':1,'N':1} ){
	// INCOMING/TARGET
	Object.clone(Signature.types[i].Wormhole, {
		0: ['','',2],
		88: ['K162','C1/2/3 (unknown)',2],
		89: ['K162','C4/5 (dangerous)',2],
		90: ['K162','C6 (deadly)',2],
		91: ['K162','H',2],
		92: ['K162','L',2],
		93: ['K162','N',2],
		94: ['K162','Thera',2]
	});
}
for( let i in {'C1':1,'C2':1,'C3':1,'C4':1,'C5':1,'C6':1,'SH':1} ){
	// FRIGATE
	Object.clone(Signature.types[i].Wormhole, {
		19: ['E004','C1',1],
		31: ['L005','C2',1],
		72: ['Z006','C3',1],
		80: ['M001','C4',1],
		9: ['C008','C5',1],
		22: ['G009','C6',1],
		50: ['Q003','N',1],
		1: ['A009','SH',1]
	});
}