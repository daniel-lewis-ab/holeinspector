
"use strict";

class Thing {
	
	constructor() {
		if(Config.test) {
			console.log('new '+this.constructor.name+'()');
		}
	}
	
	destructor(){
		if(Config.test) {
			console.log(this.constructor.name+'.destructor()');
		}
		for(let i in this.e){
			this.e[i].parentNode.removeChild(this.e[i]);
		}
	}
	
	update(p = {}) {
		if(Config.test) {
			console.log(this.constructor.name+'.update()');
		}
		let hasChange = false;
		for(let i in p) {
			if(this.hasOwnProperty(i)) {
				if(i == 'updated' || i == 'created') {
					this[i] = new Date(p[i]);
				}
				else if(this[i] != p[i]) {
					hasChange = true;
					this[i] = p[i];
				}
			}
			else {
				throw new Error(this.constructor.name+'.update(): '+i+' is not a property of '+this.constructor.name);
			}
		}
		this.draw();
		return hasChange;
	}
	
	draw(){
		if(Config.test)
			console.log(this.constructor.name+'.draw()');
	}
	
	undraw(){
		for(let i in this.e){
			if(this.e[i] instanceof Element && this.e[i].parentNode)
				this.e[i].parentNode.removeChild(this.e[i]);
		}
	}
	
	evContextmenu(ev){
		if(Config.test) {
			console.log(this.constructor.name+'.evContextmenu(ev)');
		}
		ev.preventDefault();
		ev.stopPropagation();
	}
}
