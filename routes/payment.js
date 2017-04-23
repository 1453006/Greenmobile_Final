var express = require('express');
var router = express.Router();
var product = require('../Models/Product');
var cookieParser = require('cookie-parser');
/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('payment');
});

module.exports = router;
