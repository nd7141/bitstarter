#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT = 'index.html';
var CHECKSFILE_DEFAULT = 'checks.json';
var URL_DEFAULT = 'http://powerful-inlet-1692.herokuapp.com/';

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log('%s does not exist. Exiting.', instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var getHtmlFile = function (indexurl) {
    rest.get(indexurl).on('complete', function (result) {
	if (result instanceof Error)
	    console.error('Error: ' + result.message);
	else
	    fs.writeFileSync('url_html.html', result);
    });
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --index-url <index_url>', 'Url of the app')
	.parse(process.argv);

    if (program.indexUrl) {
	rest.get(program.indexUrl).on('complete', function (urlhtml) {
	    fs.writeFile('url_indexhtml.html', urlhtml, function (err) {
		if (err) throw err;
		var checkJson = checkHtmlFile('url_indexhtml.html', program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    });
	});
    } else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
