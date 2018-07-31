var async = require('async');
var _u = require('underscore');
var dbc = require('../utils/db/db_connman');
var redis = require('../utils/cache');
var checkUserCred =  require('./user_cred');
var config = require('../config');

const outSmsMsgExpTime = config.OUTBOUND_STOP_SMS_EXP_TIME;
const smsLimit = config.OUTBOUND_SMS_LIMIT;

var getFromKey = function(smsObj, callBack){
    var checkKey = smsObj.from + '_count';
    var fromKey = smsObj.from;
    var currCount = 0;
    redis.get(checkKey, 'String', function (err, result) {
        if(err){
            var err = {};
            err.status = 400;
            err.message = "Unknown Failure";
            return callBack(err, null);
        }else{
            if(result !== 'undefined' || result != null){
                currCount = (Number(result) % smsLimit);
                fromKey = fromKey + '_' + currCount;
            }else{
                fromKey = fromKey + '_' + currCount;
            }
            var result = {
                fromKey: fromKey,
                count: currCount
            };
            return callBack(null, result);
        }
    });
};

var fromSmsVerify = function(smsObj, callBack){
    var q = "SELECT * from phone_number where number = '" + smsObj.from + "';";
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
                err.message = "From parameter not found";
                return callBack(err, null);
            }else{
                var result = {};
                result.status = 200;
                result.messag = "Valid From Parameters";
                return callBack(null,result);
            }
        }
    });
};


var isSmsBlocked = function(smsObj,callBack) {
    redis.get(smsObj.from, 'String', function (err, result) {
        if (err) {
            var err = {};
            err.status = 400;
            err.message = "Unknown Failure";
            return callBack(err, null);
        } else {
            if (result == smsObj.to) {
                var err = {};
                err.status = 400;
                err.message = "sms from " + smsObj.from + ' to '+ smsObj.to + ' is blocked';
                return callBack(err, null);
            } else {
                var result = {};
                result.status = 200;
                result.messag = "SMS not Blocked";
                return callBack(null, result);
            }
        }
    });
};

var fromKeyCount = function(smsObj, callBack){
    var fromEntriesPatt = smsObj.from + '_*'
    redis.keys(fromEntriesPatt, 'String', function(err, result) {
        if (result.length == smsLimit + 1) {
            var err = {};
            err.status = 500;
            err.message =  'limit reached  for from ' + smsObj.from ;
            return callBack(err, null);
        } else {
            return callBack(null, result.length);
        }
    });
};

var setOutMsgInCache = function(smsObj, fromKey, callBack){
    redis.set(fromKey, smsObj.to, 'String', outSmsMsgExpTime, function (err, result) {
        if (err){
            var err = {};
            err.status = 400;
            err.message = "Unknown Failure";
            return callBack(err, null);
        }else{
            var result = {};
            result.status = 200;
            result.messag = "Outbound Sms OK";
            return callBack(null,result);
        }
    });
};

var setOutMsgCount = function(smsObj, callBack){
    var countKeyName = smsObj.from + '_count';
    var keyCount = smsObj.currCount + 1;
    redis.set(countKeyName, keyCount, 'String', outSmsMsgExpTime, function (err, result) {
        if (err){
            var err = {};
            err.status = 400;
            err.message = "Unknown Failure";
            return callBack(err, null);
        }else{
            var result = {};
            result.status = 200;
            result.messag = "Outbound Sms OK";
            return callBack(null,result);
        }
    });
};

var outboundSmsEntry = function(smsObj, callBack){
    async.waterfall([
        function (cwf) {
            isSmsBlocked(smsObj, function(err,result) {
                return cwf(err, result);
            });
        },
        function (smsNotBlocked, cwf) {
            fromKeyCount(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
        function (keyCount, cwf) {
            getFromKey(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
        function (fromKeyObj, cwf) {
            smsObj.currCount = fromKeyObj.count;
            var fromKey = fromKeyObj.fromKey;
            setOutMsgInCache(smsObj, fromKey, function(err, result){
                return cwf(err,result);
            });
        },
        function (fromKey, cwf) {
            setOutMsgCount(smsObj, function(err, result){
                return cwf(err,result);
            });
        }
    ], function (err, results) {
        return callBack(err, results);
    });
};

var makeOutboundSms = function(usercred, smsObj, callBack){
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
            fromSmsVerify(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
        function (validToSms, cwf) {
            outboundSmsEntry(smsObj, function(err, result){
                return cwf(err,result);
            });
        },
    ], function (err, results) {
        return callBack(err, results);
    });
};

module.exports = {
    makeOutboundSms: makeOutboundSms
};