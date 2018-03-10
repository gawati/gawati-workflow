/** 
 *  Run this with : 
 *     node xml2json.js --name=./wf/act-legislation.xml --output=./wf/act-legislation.json
 *    to produce the runtime json for the workflow
 */
var fs = require('fs');
var parser = require('xml2json');
const args = require('yargs').argv;

// load xml 
var wf_xml = fs.readFileSync(args.name);
var out_json = args.output;
// xml to json 
var json = parser.toJson(wf_xml);
// write json to output file
fs.writeFileSync(out_json, json, 'utf8');