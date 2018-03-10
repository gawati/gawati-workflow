const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const util = require('util');
const logr = require('../logging.js');


class Workflow {

    TRANSIT_PERMISSION = 'transit';

    constructor() {
        this.wfInfo = {
            timestamp: Math.floor(Date.now() / 1000),
            wf: {}
        };
    }

    /**
     * Initializes the workflow by attempting to load it
     * Caller will have to check if the wf property is set or not.
     * 
     * @memberof Workflow
     */
    async initAsync (wfJsonPath) {
        var data = {};
        try {
         data = await fs.readFileAsync(wfJsonPath);
         this.wfInfo.wf = JSON.parse(data); 
        } catch(error) {
            logr.error("Error in initAsync while parsing JSON ", error);
        }
        return data;
    };

    /**
     * Checks if the workflow is initialized. 
     * 
     * @returns true if initialized
     * @memberof Workflow
     */
    isWorkflowInitialized() {
        return  ! (Object.keys(this.wfInfo.wf).length === 0 && this.wfInfo.wf.constructor === Object)
    }


    /**
     * 
     * 
     * @returns 
     * @memberof Workflow
     */
    getWorkflowAllowedPermissions() {
        const permissionsArr = this.wfInfo.wf.workflow.permissions.permission ; 
        return permissionsArr.slice();
    }

    /**
     * 
     * 
     * @returns 
     * @memberof Workflow
     */
    getStates() {
        if (this.wfInfo.wf.workflow) {
            return this.wfInfo.wf.workflow.states.state.slice();
        } else {
            return [];
        }
    }

    /**
     * 
     * 
     * @returns 
     * @memberof Workflow
     */
    getTransitions() {
        if (this.wfInfo.wf.workflow) {
            return this.wfInfo.wf.workflow.transitions.transition.slice();
        } else {
            return [];
        }
    }

    /**
     * 
     * 
     * @param {any} name 
     * @returns 
     * @memberof Workflow
     */
    getTransition(name) {
        let theTransition = this.getTransitions().filter((transition) =>  transition.name === name) ;
        return theTransition.length > 0 ? Object.assign({}, theTransition[0]) : null ;
    }


    /**
     * Gets state object for a specified ``stateName``
     * 
     * @param {string} stateName 
     * @returns ``state`` object
     * @memberof Workflow
     */
    getState(stateName) {
        let theState = this.getStates().filter( (state) => state.name === stateName );
        return theState.length > 0 ? JSON.parse(JSON.stringify(theState[0])) : null ;
    }

    /**
     * Gets the ``from`` and ``to`` state names for a transition specified by ``transitionName``
     * 
     * @param {string} transitionName 
     * @returns 
     * @memberof Workflow
     */
    getStateNamesForTransition(transitionName) {
        // this is the transition
        let transition =  this.getTransition(transitionName);
        if (transition !== null ) {
            return {
                "from": transition.from,
                "to": transition.to
            };
        } else {
            return null;
        }
    }


    /**
     * Gets the ``from`` and ``to`` state objects of a transition specified by ``transitionName``
     * 
     * @param {string} transitionName 
     * @returns 
     * @memberof Workflow
     */
    getStatesForTransition(transitionName) {
        let states = this.getStateNamesForTransition(transitionName);
        if (states !== null ) {
            return {
                "from": this.getState(states.from),
                "to": this.getState(states.to)
            };
        } else {
            return null;
        }
    }


    /**
     * Returns an array of transition objects which have the ``stateName`` as the ``from`` state
     * 
     * @param {string} stateName 
     * @memberof Workflow
     */
    getTransitionsForFromState(stateName) {
        return
            JSON.parse(
                JSON.stringify(this.getTransitions().filter( 
                    (transiton) => transition.from === stateName
                    )
                )
            );
    }


    /**
     * 
     * 
     * @param {string} fromThisState 
     * @memberof Workflow
     */
    getNextStateNames(fromThisState) {
        let transitions = this.getTransitionsForFromState(fromThisState);
        return
            transitions.map( (transition) => transition.to);
    }


    /**
     * 
     * 
     * @param {string} fromThisState 
     * @memberof Workflow
     */
    getNextStateObjects(fromThisState) {
        let nextStates = this.getNextStateNames(fromThisState);
        return
            nextStates.map( (state) => this.getState(state));
    }


    /**
     * 
     * @param {*} stateObj 
     * @param {*} permissionName 
     */
    getStateObjectPermission(stateObj, permissionName) {
        let thePermission = stateObj.permission.filter( (perm) => perm.name === permissionName );
        return thePermission.length > 0 ? Object.assign({}, thePermission[0]) : null; 
    }


    /**
     * Internal api find if the role exists in a string seperated list of roles.
     * @param {string} roles value of the roles attribute from ``permission``  of a state
     * @param {string} findThisRole check if this role exists in roles
     */
    findInRoles(roles, findThisRole) {
        let trimRoles = roles.replace(/\s+/g, ' ').trim() ;
        let arrRoles = trimRoles.split(" ");
        let foundRole = arrRoles.filter( (role) => role === findThisRole );
        return foundRole.length > 0 ? true : false;
    }


    /**
     * Can the role specified in ``roleName`` transit to the transition name ``transitionName``
     * @param {string} roleName name of a valid role
     * @param {string} transitionName a name of a valid transition
     */
    canRoleTransit(roleName, transitionName) {
        let states =  this.getStatesForTransition(transition);
        if (null !== states) {
            let fromState = states.from;
            let transitPermission = this.getStateObjectPermission(fromState, this.TRANSIT_PERMISSION);
            if (null !== transitPermission) {
                return this.findInRoles(transitPermission.roles, roleName) ; 
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

};

module.exports.Workflow = Workflow ;