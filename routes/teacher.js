var express = require('express');
var router = express.Router();

var Test = require('../models/test');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 题库管理
router.get('/test', function(req, res) {
  res.render('./teacher/test/index', {
    title: '题库管理'
  });
});
router.get('/test/list', function(req, res) {
  Test.list(function(err, tests) {
    res.json(tests);
  });
});

module.exports = router;