/**
 * This module can be placed anywhere but is always referenced relative to the working directory of the caller.
 * API has the following signature - first parameter is always the full 
 * workflow object, second parameter is an object which can be set by the caller.
 * Return value type is not enforced
 */


function doProcessing(wf, params) {
    return {obj: wf, params: Object.assign({valueFromFunction: "TEST_VAL"}, {...params})};
}


module.exports = {
    doProcessing: doProcessing
};