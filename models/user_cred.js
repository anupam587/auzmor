var _u = require('underscore');
var dbc = require('../utils/db/db_connman');

var checkValidUsers = function (usercred, callBack) {
    var q = "SELECT * from account where username = '" + usercred.username + "' AND auth_id = '" + usercred.auth_id +"';";
    dbc.executeQuery.call({
        sql_query: q
    }, function (err, result) {
        if(err) {
            var err = {};
            err.status = 403;
            err.message = "Invalid credentials";
            return callBack(err, null);
        } else {
            if(result.rowCount == 1){
                var result = {};
                result.status = 200;
                result.messag = "Valid User";
                return callBack(null,result);
            }else{
                var err = {};
                err.status = 403;
                err.message = "Invalid credentials";
                return callBack(err, null);
            }
        }
    });
};

var checkSmsParams = function(smsObj, callBack) {
    var allowedParams = ["to", "from", "text"];
    var visitparams = {
        "from": 0,
        "to": 0,
        "text": 0
    };

    for (param in smsObj) {
        if (allowedParams.indexOf(param) == -1) {
            var err = {};
            err.status = 400;
            err.message = "error " + param + " is invalid";
            return callBack(err, null);
        } else {
            visitparams[param] = 1;
        }
    }

    for (param in allowedParams) {
        if (visitparams[allowedParams[param]] == 0) {
            var err = {};
            err.status = 400;
            err.message = allowedParams[param] + " is missing";
            return callBack(err, null);
        }
    }

    var result = {};
    result.status = 200;
    result.messag = "Valid Parameters";
    return callBack(null,result);

};


module.exports = {
    checkValidUsers: checkValidUsers,
    checkSmsParams: checkSmsParams
};


