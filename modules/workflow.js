const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const util = require('util');
const logr = require('../logging.js');


/**
 * This is the main workflow class. Each Workflow class represents a mapping onto a Workflow JSON document.
 * 
 * @class Workflow
 */
class Workflow {

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
     * Get the permissions applicable in a state as an array of permission objects
     * 
     * @returns 
     * @memberof Workflow
     */
    getWorkflowAllowedPermissions() {
        const permissionsArr = this.wfInfo.wf.workflow.permissions.permission ; 
        return permissionsArr.slice();
    }

    /**
     * Get the states applicable in a workflow as an array of states
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
     * Get the transitions applicable in a workflow as an array of transitions
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
     * Get a transition object by its name
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
        return this.getTransitions().filter( 
                    (transition) => transition.from === stateName
                );
    }


    /**
     * Gets the next possible state names that one can transit to from a ``from`` state
     * 
     * @param {string} fromThisState 
     * @memberof Workflow
     */
    getNextStateNames(fromThisState) {
        let transitions = this.getTransitionsForFromState(fromThisState);
        let toStates = transitions.map( (transition) => transition.to);
        return toStates;
    }


    /**
     * Gets the next possible state object that one can transit to from a ``from`` state
     * 
     * @param {string} fromThisState 
     * @memberof Workflow
     */
    getNextStateObjects(fromThisState) {
        let nextStates = this.getNextStateNames(fromThisState);
        let states = nextStates.map( (state) => this.getState(state));
        return states;
    }


    /**
     * Gets a specific permission object specified by the permission name for a specific state object.
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
     * Can ``roleName`` transit to the transition name ``transitionName``, multiple role and transition combinations
     * can be passed as an array. THe result returns the same array where each item has an ``outcome`` property which 
     * can be a boolean. 
     * 
     * @param {array} an array of transition + role objects :
     * 
     *  .. code-block:: json
     *      
     *      [{'role':'editable', 'transition': 'make_editable'}, {'role':'reviewer', 'transition': 'make_publish'}]
     * 
     */
    canRoleTransit(arrTransitionRole) {
        const outcomes = arrTransitionRole.map( (transRole) => {
            transRole.outcome = this._canRoleTransit(transRole.role, transRole.transition);
            return transRole;
        });
        return outcomes;
    }

    _canRoleTransit(role, transition) {
        let states =  this.getStatesForTransition(transition);
        if (null !== states) {
            let fromState = states.from;
            let transitPermission = this.getStateObjectPermission(fromState, this.TRANSIT_PERMISSION);
            if (null !== transitPermission) {
                return this.findInRoles(transitPermission.roles, role) ; 
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

};

Workflow.prototype.TRANSIT_PERMISSION = 'transit';

module.exports.Workflow = Workflow ;