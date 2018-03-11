const expect = require('chai').expect;
const workflow = require('../modules/workflow');
const fs = require('fs');
const path = require('path');

function arrangePath() {
     return path.join('.', 'wf', 'test_wf.json') ; 
}

describe('initAsync()', function () {
    it('Loads workflow asynchronously', function (done) {
      // arrange      
      var wfJson = fs.readFileSync(arrangePath(), 'utf8');
      // 2. ACT
      var wf = new workflow.Workflow();
      wf.initAsync(arrangePath())
        .then( (ret) => { 
            var s = JSON.stringify(wf.wfInfo.wf)  ;
            expect(s).to.equal(wfJson);
            done();
        })
        .catch( (err) => { console.log(" ERR " , err) ; throw err;  });
  
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
      const statesNamesExpected = ['draft', 'editable', 'publish'];
      
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

  
  describe('getTransitions()', function () {
    it('Checks if transitions are returned', function (done) {
      
      // 1. ARRANGE
      const transitionNamesExpected = ['make_editable', 'make_drafting', 'make_publish', 'make_retract'];
      
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
      const expectedTransition = {"name":"make_retract","icon":"fa-building","title":"Retract","from":"publish","to":"editable"};
      
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
      const expectedTransitions = ['make_drafting', 'make_publish'];
      
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
      const expectedStates = ['draft', 'publish'];
      
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
  