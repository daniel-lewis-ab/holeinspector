// compat: IE9+, FF4+, Chr 4+, Op 9+ (probably)

"use strict";



window.ServerErrorHandler = function(s){
	if(s.length)
		console.log('Server response: '+s);
};
Object.clone = function(o1, o2){
	for(let i in o2)
		o1[i] = o2[i];
	return o1;
};
Object.extend = function(o1, o2){
	for(let i in o2)
		if(!o1.hasOwnProperty(i))
			o1[i] = o2[i];
	return o1;
};
Object.update = function(o1, o2){
	for(let i in o2)
		if(o1.hasOwnProperty(i))
			o1[i] = o2[i];
	return o1;
};
Object.diff = function(o1, o2){
	let o3 = {};
	for(let i in o1)
		if(o1[i] != o2[i])
			o3[i] = o2[i];
	return o3;
};
Object.flipMap = function(o){
	var o2 = {};
	for(var i in o)
		o2[o[i]] = o[i];
	return o2;
};

// Date
Date.prototype.getUTCDateTime = function(){
	return this.getUTCFullYear()+'-'+('00'+(this.getUTCMonth()+1)).slice(-2)+'-'+('00'+this.getUTCDate()).slice(-2)+' '+('00'+this.getUTCHours()).slice(-2)+':'+('00'+this.getUTCMinutes()).slice(-2)+':'+('00'+this.getUTCSeconds()).slice(-2)+' GMT';
};
Date.prototype.toLastYear = function(){
	this.setFullYear(this.getFullYear()-1);
	return this;
};

// Elements
Object.defineProperty(Element.prototype, "destroy", {
	value:function(){
		this.parentNode.removeChild(this);
	},
	writeable:false
});
Object.defineProperty(Element.prototype, "bind", {
	value:function(k,f){
		this.addEventListener(k,function(ev){
			return f(ev||window.event);
		});
	},
	writeable:false
});
Object.defineProperty(Element.prototype, "getTags", {
	value:function(s){
		return this.getElementsByTagName(s);
	},
	writeable:false
});
Object.defineProperty(Element.prototype, "getContent", {
	value:function(p){
		var id = this.id;
		document.getStream(p,function(s){
			document.getId(id).innerHTML = s;
		});
		return this;
	},
	writeable:false
});
Object.defineProperty(Element.prototype, "populate", {
	value:function(o, b){
		let x;
		for(let i in o){
			x = $.createElement('option');
			x.text = o[i];
			x.value = i;
			this.add(x);
		}
	},
	writeable:false
});
Element.prototype.classListSelect = function(o, choice){
	for(let i in o)
		(isNaN(i))
		?	this.classList.toggle(i, i == choice)
		:	this.classList.toggle(o[i], o[i] == choice);
};

// documentElement
Object.defineProperty(document, "getId", {
	value:function(s){
		var e=document.getElementById(s);
		if(!e instanceof Element)
			throw new Error('getId(): Element with id='+s+' not found');
		return e;
	},
	writeable:false
});
Object.defineProperty(document, "getQ", {
	value:function(s){
		return this.querySelectorAll(s);
	},
	writeable:false
});
Object.defineProperty(document, "getStream", {
	value:function(p,x){
		if(Config.test)
			console.log('document.getStream("'+p+'");');
		if(Config.local)
			return;
		window.xhr = new XMLHttpRequest();
		var resp;
		var err;
		var stat;
		xhr.open('GET',p,true);
		xhr.onload = function() {
			resp = xhr.responseText;
			err = xhr.statusText;
			stat = xhr.status;
			if (stat == 200 && resp.toLowerCase().indexOf('error') == -1)
				x(resp);
			else if(stat != 0)
				throw new Error('Request failed with Error '+stat+':'+err);
		};
		xhr.send();
	},
	writeable:false
});
Object.defineProperty(document, "encodeArguments", {
	value:function(file,p){
		var s = '';
		var f = false;
		for(var i in p) {
			if(f)
				s += '&';
			s += encodeURIComponent(i) + '=' + encodeURIComponent(p[i]);
			f = true;
		}
		return file+(f?'?':'')+s;
	},
	writable:false
});
		
window.$ = document;
