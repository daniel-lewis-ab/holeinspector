
class Panel {
	constructor(name){
		this.e = {};
		this.name = name;
		this.tabs = [];
		this.currentTab;
		this.draw();
	}
	draw(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.draw());
			return;
		}
		this.e.panel = $.querySelector('dialog#'+this.name);
		this.e.close = $.querySelector('dialog#'+this.name+' .close');
		this.e.main = $.querySelector('dialog#'+this.name+' > main');
		this.e.nav = $.querySelector('dialog#'+this.name+' > nav');
		this.e.ul = $.querySelector('dialog#'+this.name+' > nav > ul');
		this.e.header = $.querySelector('dialog#'+this.name+' header');
		this.e.show = $.querySelector('li a#show_'+this.name);

		this.e.header.bind('click',(ev) => this.evHeaderClick(ev));
		this.e.close.bind('click',(ev) => this.evCloseClick(ev));
		this.e.show.bind('click',(ev) => this.evShowClick(ev));
	}
	show(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.show());
			return;
		}
		this.e.main.style.display = 'block';
		this.e.nav.style.display = 'inline-block';
	}
	hide(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.hide());
			return;
		}
		this.e.main.style.display='none';
		this.e.nav.style.display='none';
	}
	addTab(name){
		let tab = new Tab(this, name);
		this.tabs.push( tab );
		return tab;
	}
	evShowClick(ev){
		this.show();
	}
	evHeaderClick(ev){
		this.show();
	}
	evCloseClick(ev){
		this.hide();
	}
}

class Tab {
	constructor(panel, name){
		this.panel = panel;
		this.name = name;
		
		this.li = null;
		this.a = null;
		this.section = null;
		
		this.panel.tabs.push(this);
		this.draw();
	}
	draw(){
		this.drawMenu();
		this.drawSection();
	}
	drawMenu(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawMenu());
			return;
		}
		if(this.li instanceof Element)
			return;
		this.li = $.createElement('li');
		this.a = $.createElement('a');
		this.a.innerText = this.name;
		this.a.bind('click',() => this.setCurrent());
		this.li.appendChild(this.a);
		this.panel.e.ul.appendChild(this.li);
	}
	drawSection(){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',() => this.drawSection());
			return;
		}
		if(this.section instanceof Element)
			return;
		this.section = $.getId(this.panel.name+'_'+this.name);
		if(! this.section){
			this.section = $.createElement('section');
			this.section.id = this.panel.name+'_'+this.name;
			this.panel.e.main.appendChild(this.section);
		}
	}
	setName(n){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',(name) => this.setName(n));
			return;
		}
		this.name = n;
		this.a.innerText = n;
	}
	setCurrent(b=1){
		if(b){
			if(this.panel.currentTab)
				this.panel.currentTab.setCurrent(0);
			this.panel.currentTab = this;
		}
		this.drawCurrent(b);
	}
	drawCurrent(b=1){
		if(document.readyState == 'loading'){
			window.addEventListener('DOMContentLoaded',(b) => this.drawCurrent(b));
			return;
		}
		if(this.li instanceof Element)
			this.li.classList.toggle('selected',b);
		if(this.section instanceof Element)
			this.section.classList.toggle('selected',b);
		this.panel.show();
	}
}

window.ChainPanel = new Panel('chain');
window.SystemPanel = new Panel('system');
window.SignaturePanel = new Panel('signatures');
