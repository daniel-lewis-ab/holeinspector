
class Time extends Date {
	get milliseconds() { return this.getMilliseconds(); }
	set milliseconds(n) { this.setMilliseconds(n); }
	
	get seconds() { return this.getSeconds(); }
	set seconds(n)  { this.setSeconds(n); }
	
	get minutes()  { return this.getMinutes(); }
	set minutes(n)  { this.setMinutes(n); }
	
	get hours()  { return this.getHours(); }
	set hours(n)  { this.setHours(n); }
	
	get weekday()  { return 1+this.getDay(); }
	set weekday(n)  { this.setDay(n-1); }
	
	get date()  { return this.getDate(); }
	set date(n)  { this.setDate(n); }
	
	get month()  { return 1+this.getMonth(); }
	set month(n)  { this.setMonth(n-1); }
	
	get year()  { return this.getFullYear(); }
	set year(n)  { this.setFullYear(n); }
	
	get timestamp()  { return this.getTime(); }
	set timestamp(n)  { this.setTime(n); }
	
	get timezone()  { return (this.getTimezoneOffset()/60); }
	set timezone(n)  { this.setTimezoneOffset(n*60); }
	
	toDateString(l,o){ return this.toLocaleDateString(l,o); }
	toTimeString(l,o){ return this.toLocaleTimeString(l,o); }
	toString(l,o){ return this.toLocaleString(l,o); }
	toSource(){ return `new Time(${this.timestamp})`; }
}
/**
	// Test:
	x = new Time();
	x.timezone = 4;
	x.hours = 3;
	x.minutes = 15;
	x.minutes++;
	alert(x);
*/