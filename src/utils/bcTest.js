const path = require('path');
let shell = require('shelljs');
const fs = require('fs');
let Console = require('./console');

module.exports = function({ socket, files, config }){

    const configPath = path.resolve(__dirname,`./config/tester/${config.tester}/${config.language}.config.js`);
    if (!fs.existsSync(configPath)){
      Console.error(`No testing engine has been found for: '${config.language}'`);
      socket.log('internal-error', [`Uknown testing engine for compiler: '${config.language}'`]);
      return;
    }

    try{
      const config = require(configPath)(files);
      config.validate();
      Console.info('Running tests...');

      config.getCommand(socket)
        .then(command => {

            const { stdout, stderr, code } = shell.exec(command);

            if(code != 0){
              const errors = typeof config.getErrors != 'undefined' ? config.getErrors(stdout || stderr) : [];
              let errorLog = [ stdout || stderr ];
              let msg = '';
              if(errors.length > 0){
                msg = `   You are failing on the following tests: \n ${errors.map(e => "      ✗ " + e + "\n").join()}`;
                errorLog.push(msg);
              }
              socket.log('testing-error', errorLog, errors);
              Console.error("There was an error while testing \n"+msg);
            }
            else{
              socket.log('testing-success',[ stdout || stderr ]);
              Console.success("Everything is amazing!");
            }
            if(typeof config.cleanup !== "undefined"){
              if(typeof config.cleanup === 'function' || typeof config.cleanup === 'object') return config.cleanup(socket);
            }
        })
        .then(command => {
            if(command){
              const { stdout, stderr, code } = shell.exec(command);
              if(code == 0){
                Console.debug("The cleanup command runned successfully");
              }
              else Console.warning("There is an error on the cleanup command for the test");
            }
        });
    }
    catch(err){
      socket.log('internal-error',[ err.message, err.toString() ]);
      Console.error(err.message, err.toString());
    }

};
