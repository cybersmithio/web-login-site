var debugLogFlag=true;

module.exports = function() {
	if( !debugLogFlag ) return;
	var i;
	var message="";
	for (i=0;i<arguments.length;i++) {
		//console.log('debugLog argument[',i,']=',arguments[i]);
		message=message+' '+arguments[i]
		//console.log('debugLog message:',message);
	}
	console.log('DEBUG:',arguments.callee.caller.name,'-',message);
};

