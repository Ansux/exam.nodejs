var express = require('express');
var router = express.Router();
var _ = require('underscore');

var Test = require('../models/test');
var Subject = require('../models/subject');
var TestType = require('../models/testType');
var Teacher = require('../models/teacher');

/* GET users listing. */
router.get('*', function(req, res, next) {
  res.locals.teacher = req.session.teacher || null;
  next();
});

// 登录
router.get('/account/signin', function(req, res) {
  res.render('./teacher/account/signin', {
    title: '教师登录'
  });
});
router.post('/account/signin', function(req, res) {
  var sid = req.body.sid;
  var pwd = req.body.pwd;
  Teacher.findOne({
    email: sid
  }, function(err, teacher) {
    if (err || !teacher) {
      console.log('用户不存在！');
    }
    teacher.validPwd(pwd, function(result) {
      if (!result) {
        console.log('密码错误！');
        return;
      }
      req.session.teacher = teacher;
      res.redirect('/teacher/test');
    });
  });
});

// 注册
router.get('/account/signup', function(req, res) {
  res.render('./teacher/account/signup', {
    title: '教师注册'
  });
});
router.post('/account/signup', function(req, res) {
  var formTeacher = req.body.teacher;
  var _teacher = new Teacher(formTeacher);
  _teacher.save(function(err, teacher) {
    if (err) {
      console.log(err);
      return;
    }
    req.session.teacher = teacher;
    res.redirect('/teacher/test');
  });
});

// 注销
router.get('/account/signout', function(req, res) {
  delete req.session.teacher;
  res.redirect('/teacher/account/signin');
});

// 题库管理
router.get('/test', function(req, res) {
  res.render('./teacher/test/index', {
    title: '题库管理'
  });
});
router.get('/getTestList', function(req, res) {
  Test.list(function(err, tests) {
    res.json(tests);
  });
});
router.get('/getSubjectList', function(req, res) {
  Subject.list(function(err, subjects) {
    res.json(subjects);
  });
});
router.get('/getTestTypeList', function(req, res) {
  TestType.list(function(err, types) {
    res.json(types);
  });
});
router.post('/testSubmit', function(req, res) {
  var formTest = req.body.testForm;
  formTest.author = req.session.teacher._id;
  console.log(formTest);

  var id = formTest._id;
  var _test;
  var promise = new Promise(function(resolve, reject) {
    if (id) {
      Test.findById(id, function(err, test) {
        _test = _.extend(test, formTest);
        resolve(true);
      });
    } else {
      _test = new Test(formTest);
      resolve(true);
    }
  });

  promise.then(function(val){
    _test.save(function (err, test) {
      if (err) {
        console.log(err);
        return;
      }
      res.json(test);
    });
  });
});

// 试卷管理
router.get('/paper',function(req,res){
  res.render('./teacher/paper/list',{
    title: '试卷管理'
  });
});
module.exports = router;