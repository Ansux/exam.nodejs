var express = require('express');
var router = express.Router();
var Student = require('../models/student');

// 登录过滤器
router.get("*", function(req, res, next) {
  res.locals.student = req.session.student || null;
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('account/signin');
});

// 学生登录
router.get('/account/signin', function(req, res) {
  res.render('./student/account/signin', {
    title: '学生登录'
  });
});
router.post('/account/signin', function(req, res) {
  var sid = req.body.sid;
  var pwd = req.body.pwd;

  Student.findOne({
    email: sid
  }, function(err, stu) {
    if (err) {
      console.log(err);
      return;
    }
    stu.validPwd(pwd, function(result) {
      if (!result) return res.redirect('/account/signin');
      req.session.student = stu;
      res.redirect('/');
    });
  });
});

// 学生注册
router.get('/account/signup', function(req, res) {
  res.render('./student/account/signup', {
    title: '学生注册'
  });
});
router.post('/account/signup', function(req, res) {
  var formStu = req.body.stu;
  var _stu = new Student(formStu);
  _stu.save(function(err, stu) {
    if (err) return res.redirect('/account/signup');
    req.session.student = stu;
    res.redirect('/');
  });
});

// 退出登录
router.get('/account/signout', function(req, res) {
  delete req.session.student;
  res.redirect('/');
});

module.exports = router;