
const logr = require('./logging.js');
const workflow = require('./modules/workflow');
const path = require('path');
const Promise = require('bluebird');




var wf = new workflow.Workflow();

 wf.initAsync(path.join('.', 'wf', 'act-legislation.json'))
  .then( (outstanding) => {
    logr.info(" WF == ", wf.getStates());
  })
  .catch( (err) => {
    logr.error(" ERROR HAPEND ", err);
  });