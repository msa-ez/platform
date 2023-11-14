var iniparser = require('iniparser');

function reader(){
    var arg = process.argv[2];
    console.log(arg)
    var config = iniparser.parseSync('./config/config.ini');
    
    return config[arg];
}

exports.reader = reader;
