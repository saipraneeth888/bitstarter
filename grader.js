#!/usr/bin/env node
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "https://www.google.com";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist.Exiting.",instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile,checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(url,checksfile){
rest.get(url).on('complete',function(data){
        $ = cheerio.load(data);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks){
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
    var outJson = JSON.stringify(out,null,4);
    console.log(outJson);
    });
}

var clone =function(fn) {
    return fn.bind({});
};

if(require.main == module){
    program
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'take a url',URL_DEFAULT)
	.option('-c, --checks <check_file>','Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.parse(process.argv);
    if(program.file){
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);    
    }
    else{
	checkUrl(program.url, program.checks);
            }
}else{
    exports.checkHtmlFile = checkHtmlFile;
}
