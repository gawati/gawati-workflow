const winston = require('winston');

console.log( "INSTANTIATING logger");
module.exports = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'gawati-workflow.log' })
    ]
  });

