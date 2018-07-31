var express = require('express');
var router = express.Router();
var inboundSms = require('../models/inbound_sms');
var outboundSms = require('../models/outbound_sms');

router.get('/', function (req, res, next) {
    return res.json({title: 'Auzmor'});
});

router.post('/inbound/sms', function (req, res, next) {
    var usercred = {};
    usercred.username = req.headers.username || '';
    usercred.auth_id = req.headers.auth_id || '';
    inboundSms.makeInboundSms(usercred, req.body, function (error, result) {
        if(error){
            return res.json(error);
        }else{
            return res.json(result);
        }
    });
});

router.post('/outbound/sms', function (req, res, next) {
    var usercred = {};
    usercred.username = req.headers.username || '';
    usercred.auth_id = req.headers.auth_id || '';
    outboundSms.makeOutboundSms(usercred, req.body, function (error, result) {
        if(error){
            return res.json(error);
        }else{
            return res.json(result)
        }
    });
});

module.exports = router;
