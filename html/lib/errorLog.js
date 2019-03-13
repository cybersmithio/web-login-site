module.exports = function () {
	var i;
	var message="";
	for (i=0;i<arguments.length;i++) {
		message=message+' '+arguments[i]
	}
	console.log('ERROR:',arguments.callee.caller.name,'-',message);
}


