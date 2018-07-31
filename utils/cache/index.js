var redis = require("redis");
var _u = require('underscore');
var config = require('../../config');
const TAG = "REDIS";

var client = null;

const redisHost = config.REDIS_SERVER_HOST || 'localhost';
const redisPort = config.REDIS_SERVER_PORT || '6379';

var connectRedisClient = function () {
    client = redis.createClient([redisHost, redisPort]);

    client.on('connect', function () {
        console.log('%s: client connected!', TAG);
    });
    client.on('error', function (err) {
        console.error('%s: error event %s', TAG, err);
    });
    client.on('reconnecting', function (ack) {
        console.log('%s: client reconnecting!  %s', TAG, ack);
    });
    client.on('ready', function () {
        console.log('%s: client ready!', TAG);
    });
    client.on('end', function () {
        console.log('%s: client end!', TAG);
    });
};

connectRedisClient();

var get = function (k, vType, callBack) {
    if (!isRedisClientConnected())
        return callBack('redis client is not connected', null);
    else {
        k = keyMaker(k);//Encode key, multiple attributes need to delimited by colon
        client.get(k, function (err, reply) {
            if (!_u.isNull(reply) && !_u.isUndefined(reply)) {
                if (vType === 'json') {
                    try {
                        reply = JSON.parse(reply);
                    }
                    catch (jsonParseExc) {
                    }
                }
                return callBack(err, reply);
            }
            else
                return callBack(null, null);
        });
    }
};

var keys = function (patt, vType, callBack) {
    if (!isRedisClientConnected())
        return callBack('redis client is not connected', null);
    else {
        client.keys(patt, function (err, reply) {
            if (!_u.isNull(reply) && !_u.isUndefined(reply)) {
                if (vType === 'json') {
                    try {
                        reply = JSON.parse(reply);
                    }
                    catch (jsonParseExc) {
                    }
                }
                return callBack(err, reply);
            }
            else
                return callBack(null, null);
        });
    }
};

var set = function (k, v, vType, expiresInSec, callBack) {
    if (!isRedisClientConnected()) {
        if (callBack && _u.isFunction(callBack)) //CallBack interfaces
            return callBack('redis client is not connected', null);
        else
            return false;
    }
    else {
        k = keyMaker(k);//Encode key, multiple attributes need to delimited by colon
        if (!_u.isUndefined(v) && !_u.isNull(v)) {//Check if value is defined.. Caching undefined value does not make any sense here...
            if (_u.isObject(v) && vType && vType === 'json')//Stringify json in cases vType JSON is explicitly mentioned.. Redis cannot save obj, so need to stringify
                v = JSON.stringify(v);
            client.setex(k, expiresInSec, v, function (err, reply) {
                if (callBack && _u.isFunction(callBack)) {//CallBack interfaces
                    console.log('TAG: %s, updated %s', TAG, k);
                    return callBack(err, reply);
                }
                else
                    return (!_u.isUndefined(reply) && !_u.isNull(reply));//Non callBack interfaces
            });
        }
        else {
            console.error("TAG:%s cannot set undefined val=%s", TAG, v);
            if (callBack && _u.isFunction(callBack))//CallBack interfaces
                return callBack("cannot set undefined val", null);
            else
                return false;
        }
    }
};

var keyMaker = function (k) {
    if (_u.isArray(k))
        return k.join(':');
    else
        return k;
};

var quitRedisClients = function () {
    client.quit();
    console.info("Exit Redis Client");
};

var isRedisClientConnected = function () {
    return (client && client.connected);
};

module.exports = {
    get: get,
    set: set,
    keys: keys,
    quitRedisClients: quitRedisClients
};

