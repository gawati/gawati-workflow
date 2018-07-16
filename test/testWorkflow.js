const expect = require('chai').expect;
const workflow = require('../modules/workflow');
const fs = require('fs');
const path = require('path');

const TEST_WF_JSON = {"workflow":{"doctype":"test","subtype":"subtest","modulePath":"test/testModule.js","permissions":{"permission":[{"name":"view","title":"View","icon":"fa-eye"},{"name":"edit","title":"Edit","icon":"fa-pencil"},{"name":"delete","title":"Delete","icon":"fa-trash-o"},{"name":"list","title":"List","icon":"fa-flag"},{"name":"transit","title":"Transit","icon":"fa-flag"}]},"states":{"state":[{"name":"draft","title":"Draft","level":"1","color":"initial","permission":[{"name":"view","roles":"admin submitter"},{"name":"list","roles":"admin submitter"},{"name":"edit","roles":"admin submitter"},{"name":"delete","roles":"admin submitter"},{"name":"transit","roles":"admin submitter"}]},{"name":"editable","title":"Editable","level":"2","color":"initial","permission":[{"name":"view","roles":"admin editor"},{"name":"list","roles":"admin editor submitter"},{"name":"delete","roles":"admin editor"},{"name":"edit","roles":"admin editor"},{"name":"transit","roles":"admin editor"}]},{"name":"processing","title":"Processing","level":"2","color":"initial","permission":[{"name":"view","roles":"admin editor"},{"name":"list","roles":"admin editor submitter"},{"name":"delete","roles":"admin editor"},{"name":"edit","roles":"admin editor"},{"name":"transit","roles":"admin editor"}]},{"name":"publish","title":"Published","level":"5","color":"final","permission":[{"name":"view","roles":"admin public"},{"name":"list","roles":"admin publisher"},{"name":"transit","roles":"admin publisher editor"}]}]},"transitions":{"transition":[{"name":"make_editable","icon":"fa-thumbs-up","title":"Send for Editing","from":"draft","to":"editable"},{"name":"make_drafting","icon":"fa-thumbs-up","title":"Back to Drafting","from":"editable","to":"draft"},{"name":"make_processing","icon":"fa-building","title":"Send for Publish","from":"editable","to":"processing","postTransit":"doProcessing"},{"name":"make_publish","icon":"fa-building","title":"Publish","from":"processing","to":"publish","bySystem":"true","preTransit":"doPreProcessing"},{"name":"make_retract","icon":"fa-building","title":"Retract","from":"publish","to":"editable","bySystem":"false"}]}}};

function arrangeWfPath() {
  return path.join('.', 'wf')
}

function arrangePath() {
     return path.join(arrangeWfPath(), 'test_wf.json') ; 
}

describe('discover()', function() {
    it('Finds workflows in specified paths and loads them into memory', function(done) {
      //arrange
      var wfFiles = ['act-legislation.json', 'test_wf.json'];
      workflow.discover(path.join('.', 'wf'))
        .then( (workflows) => {
            for (let workflow of workflows) {
              let wfName = workflow.name ; 
              let wfObject = workflow.object ;
              const wfIndex = wfFiles.indexOf(wfName);
              expect(wfIndex).to.be.greaterThan(-1);
              expect(wfObject.wfInfo.status).to.equal('valid');
              const objExists = Object.keys(wfObject.wfInfo.wf).length === 0 && wfObject.wfInfo.wf.constructor === Object ;
              expect(objExists).to.equal(false);
            }
        })
        .catch( (err) => {
          console.log(" ERROR HAPEND ", err);
        });
      done();
      })
});

describe('discoverSync()', function() {
    it('Finds workflows in specified paths and loads them into memory synchronously', function(done) {
      //arrange
      var wfFiles = ['act-legislation.json', 'test_wf.json'];
      var workflows = workflow.discoverSync(path.join('.', 'wf'));
      for (let workflow of workflows) {
        let wfName = workflow.name ;
        let wfObject = workflow.object ;
        const wfIndex = wfFiles.indexOf(wfName);
        expect(wfIndex).to.be.greaterThan(-1);
        expect(wfObject.wfInfo.status).to.equal('valid');
        const objExists = Object.keys(wfObject.wfInfo.wf).length === 0 && wfObject.wfInfo.wf.constructor === Object ;
        expect(objExists).to.equal(false);
      }
      done();
    })
});

describe('initAsync()', function () {
    it('Loads workflow asynchronously', function (done) {
      // arrange      
      var wfJson = TEST_WF_JSON;
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            var s = JSON.stringify(wf.wfInfo.wf)  ;
            expect(JSON.stringify(wfJson)).to.equal(s);
            done();
        })
        .catch( (err) => { console.log(" ERR " , err) ; throw err;  });
  
    });
  });

  describe('initSync()', function () {
    it('Loads workflow synchronously', function (done) {
      // arrange
      var wfJson = TEST_WF_JSON;
      // 2. ACT
      var wf = new workflow.Workflow();
      var ret = wf.initSync(arrangePath());
      var s = JSON.stringify(wf.wfInfo.wf)  ;
      expect(JSON.stringify(wfJson)).to.equal(s);
      done();
    });
  });

  describe('getWorkflowTypeInfo()', function () {
    it('Get the workflow type information', function (done) {
      
      // 1. ARRANGE
      const shouldExpect = {doctype: 'test', subtype: 'subtest', status: 'valid'}; 
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            expect(wf.getWorkflowTypeInfo()).to.deep.equal(shouldExpect);
            done();
        })
        .catch( (err) => { throw err;  });
  
    });
  });
  
  describe('isWorkflowInitialized()', function () {
    it('Checks if Workflow is initialized', function (done) {
      
      // 1. ARRANGE
      const shouldExpect = true; 
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            expect(wf.isWorkflowInitialized()).to.equal(shouldExpect);
            done();
        })
        .catch( (err) => { throw err;  });
  
    });
  });

  
  describe('getStates()', function () {
    it('Checks if states are returned', function (done) {
      
      // 1. ARRANGE
      const statesNamesExpected = ['draft', 'editable', 'processing','publish'];
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const states = wf.getStates();
            expect(states.length).to.be.equal(statesNamesExpected.length);
            states.map( (state) =>  {
              var foundIndex = statesNamesExpected.indexOf(state.name) ;
              expect(foundIndex).to.be.greaterThan(-1);
            });
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('getStates()', function () {
    it('Checks if states are returned synchronously', function (done) {

      // 1. ARRANGE
      const statesNamesExpected = ['draft', 'editable', 'processing', 'publish'];

      // 2. ACT
      var wf = new workflow.Workflow();
      var ret = wf.initSync(arrangePath());
      const states = wf.getStates();
      expect(states.length).to.be.equal(statesNamesExpected.length);
      states.map( (state) =>  {
        var foundIndex = statesNamesExpected.indexOf(state.name) ;
        expect(foundIndex).to.be.greaterThan(-1);
      });
      done();
    });
  });
  
  describe('getTransitions()', function () {
    it('Checks if transitions are returned', function (done) {
      
      // 1. ARRANGE
      const transitionNamesExpected = ['make_editable', 'make_drafting', 'make_publish', 'make_processing', 'make_retract'];
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const transitions = wf.getTransitions();
            expect(transitions.length).to.be.equal(transitionNamesExpected.length);
            transitions.map( (transition) =>  {
              var foundIndex = transitionNamesExpected.indexOf(transition.name) ;
              expect(foundIndex).to.be.greaterThan(-1);
            });
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('getState()', function () {
    it('Checks if a state is returned correctly', function (done) {
      
      // 1. ARRANGE
      const expectedState = {"name":"editable","title":"Editable","level":"2","color":"initial","permission":[{"name":"view","roles":"admin editor"},{"name":"list","roles":"admin editor submitter"},{"name":"delete","roles":"admin editor"},{"name":"edit","roles":"admin editor"},{"name":"transit","roles":"admin editor"}]};
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const editableState = wf.getState('editable')
            expect(JSON.stringify(editableState)).to.be.equal(JSON.stringify(expectedState));
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });


  describe('getTransition()', function () {
    it('Checks if a transition is returned correctly', function (done) {
      
      // 1. ARRANGE
      const expectedTransition = {"name":"make_retract","icon":"fa-building","title":"Retract","from":"publish","to":"editable","bySystem":"false"};
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const retTransition = wf.getTransition('make_retract');
            expect(JSON.stringify(retTransition)).to.equal(JSON.stringify(expectedTransition));
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('isSystemTransition()', function () {
    it('Checks if a transition is a system transition', function (done) {
      
      // 1. ARRANGE
      const expectedTransitionSystemFlags = {"make_processing": false, "make_publish": true, "make_retract": false};
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => {
            const tranNames  = Object.keys(expectedTransitionSystemFlags); 
            for (var i=0; i < tranNames.length ; i++) {
              const retTransition = wf.isSystemTransition(tranNames[i]);
              expect(retTransition).to.equal(
                expectedTransitionSystemFlags[tranNames[i]]
              );
            }
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });


  describe('getPreTransit()', function () {
    it('gets Pre Transit action name', function (done) {
      
      // 1. ARRANGE
      const expectedActionName = "doPreProcessing";
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => {
          const preTrans = wf.getPreTransitAction("make_publish");
          expect(preTrans).to.equal(expectedActionName);
          done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('getPostTransit()', function () {
    it('gets Post Transit action name', function (done) {
      
      // 1. ARRANGE
      const expectedActionName = "doProcessing";
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => {
          const preTrans = wf.getPostTransitAction("make_processing");
          expect(preTrans).to.equal(expectedActionName);
          done();
        })
        .catch( (err) => { throw err;  });
    });
  });
  
  describe('callModuleAction()', function () {
    it('calls a pre or post transit action as loaded by the workflow', function (done) {
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => {
          const mPath = path.resolve(wf.getActionModulePath());
          const actionRet = wf.callModuleAction(mPath, 'doProcessing', {name: "callingDoProcessing"});
          expect(actionRet.params.name).to.equal("callingDoProcessing");
          expect(actionRet.params.valueFromFunction).to.equal("TEST_VAL");
          done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  

  describe('getStatesForTransition()', function () {
    it('Checks if the state objects for a transition are returned correctly', function (done) {
      
      // 1. ARRANGE
      const expectedStates = {"from":"publish","to":"editable"};
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const states = wf.getStatesForTransition('make_retract');
            const fromState = states.from ;
            const toState = states.to ; 
            expect(fromState.name).to.equal(expectedStates.from);
            expect(toState.name).to.equal(expectedStates.to);
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('getTransitionsForFromState()', function () {
    it('Gets the transitions where the state appears as the from origin state', function (done) {
      
      // 1. ARRANGE
      const expectedTransitions = ['make_drafting', 'make_processing'];
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const transitions = wf.getTransitionsForFromState('editable');
            expect(transitions.length).to.equal(expectedTransitions.length);
            transitions.map( (transition) => {
                const foundIndex = expectedTransitions.indexOf(transition.name);
                expect(foundIndex).to.be.greaterThan(-1);
            });
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });

  describe('getNextStateObjects()', function () {
    it('Gets the next possible states from a state', function (done) {
      
      // 1. ARRANGE
      const expectedStates = ['draft', 'processing'];
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const states = wf.getNextStateObjects('editable');
            expect(states.length).to.equal(expectedStates.length);
            states.map( (state) => {
                const foundIndex = expectedStates.indexOf(state.name);
                expect(foundIndex).to.be.greaterThan(-1);
            });
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });
  
  describe('canRoleTransit()', function () {
    it('Check if a role is allowed to transit on a particular transition', function (done) {
      
      // 1. ARRANGE
      const testOutcome =  [
        {'role':'public', 'transition':'make_retract'}, 
        {'role':'publisher', 'transition':'make_retract'}, 
        {'role':'editor', 'transition': 'make_editable'}, 
        {'role':'editor', 'transition': 'make_publish'}
      ];
      const expectedOutcome = [
        {'role':'public', 'transition':'make_retract', 'outcome': false}, 
        {'role':'publisher', 'transition':'make_retract', 'outcome': true}, 
        {'role':'editor', 'transition': 'make_editable', 'outcome': false}, 
        {'role':'editor', 'transition': 'make_publish', 'outcome': true}
      ];
      
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            const outcomes = wf.canRoleTransit(testOutcome);
            expect(JSON.stringify(expectedOutcome)).to.equal(JSON.stringify(outcomes));
            done();
        })
        .catch( (err) => { throw err;  });
    });
  });
  