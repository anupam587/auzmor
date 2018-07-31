var async = require('async');
var _u = require('underscore');
var dbc = require('../utils/db/db_connman');
var redis = require('../utils/cache');
var checkUserCred =  require('./user_cred');
var config = require('../config');

const inbStopMsgExpTime = config.INBOUND_STOP_SMS_EXP_TIME;

var toSmsVerify = function(smsObj, callBack){
    var q = "SELECT * from phone_number where number = '" + smsObj.to + "';";
    dbc.executeQuery.call({
        sql_query: q
    }, function (err, result) {
        if(err) {
            var err = {};
            err.status = 520;
            err.message = "Unknown Error";
            return callBack(err, null);
        } else {
            if(result.rowCount == 0){
                var err = {};
                err.status = 500;
                err.message = "to parameter not found";
                return callBack(err, null);
            }else{
                var result = {};
                result.status = 200;
                result.messag = "to parameter is verified";
                return callBack(null,result);
            }
        }
    });
};

var stopSms = function(smsObj, callBack){
    if (smsObj.text.toLowerCase() == 'stop'){
        redis.set(smsObj.from, smsObj.to, 'String', inbStopMsgExpTime, function(err,result){
            if(err){
                var err = {};
                err.status = 400;
                err.message = "Unknown Failure";
                return callBack(err, null);
            }else{
                var result = {};
                result.status = 200;
                result.messag = "Inbound Sms OK";
                return callBack(null,result);
            }
        });
    }else{
        var result = {};
        result.status = 200;
        result.messag = "Inbound Sms OK";
        return callBack(null,result);
    }
};

var makeInboundSms = function(usercred, smsObj, callBack){
    async.waterfall([
        function (cwf) {
            checkUserCred.checkValidUsers(usercred, function(err,result) {
                return cwf(err, result);
            });
        },
        function (validUser, cwf) {
            checkUserCred.checkSmsParams(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
        function (validSms, cwf) {
            toSmsVerify(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
        function (validToSms, cwf) {
            stopSms(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
    ], function (err, results) {
        return callBack(err, results);
    });
};

module.exports = {
    makeInboundSms: makeInboundSms
};