/** 
 *  Run this with : 
 *     node xml2json.js --name=./wf/act-legislation.xml > ./wf/act-legislation.json
 *    to produce the runtime json for the workflow
 */
var fs = require('fs');
var parser = require('xml2json');
const args = require('yargs').argv;

// load xml 
var wf_xml = fs.readFileSync(args.name);
// xml to json 
var json = parser.toJson(wf_xml);
console.log(json)