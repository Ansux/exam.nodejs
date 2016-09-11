var express = require('express');
var router = express.Router();
var _ = require('underscore');

var Test = require('../models/test');
var Subject = require('../models/subject');
var TestType = require('../models/testType');
var Teacher = require('../models/teacher');
var Paper = require('../models/paper');

/* GET users listing. */
router.get('*',function (req,res,next) {
  var teacher = req.session.teacher || null;
  res.locals.teacher = teacher;
  var url = req.url;
  if (['/account/signin', '/account/signup'].indexOf(url) !== -1) {
    next();
  } else {
    if (!teacher) return res.redirect('/teacher/account/signin');
    next();
  }
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
  var subject = req.query.subject;
  var type = req.query.type;
  Test.search({ subject: subject, type: type }, function(err, tests) {
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
      formTest.author = req.session.teacher._id;
      _test = new Test(formTest);
      resolve(true);
    }
  });

  promise.then(function(val) {
    _test.save(function(err, test) {
      if (err) {
        console.log(err);
        return;
      }
      res.json(test);
    });
  });
});
router.get('/test/list', function(req, res) {
  var subject = req.query.subject;
  var type = req.query.type;
  Test.find({
    subject: subject,
    type: type
  }, function(err, tests) {
    res.json(tests);
  });
});

// 试卷管理
router.get('/paper', function(req, res) {
  res.render('./teacher/paper/index', {
    title: '试卷管理'
  });
});
router.get('/paper/detail/:id', function(req, res) {
  var id = req.params.id;
  Paper.findById(id, function(err, paper) {
    res.render('./teacher/paper/detail', {
      title: '试卷详情',
      paper: paper
    });
  });
});
router.get('/getPaperList', function(req, res) {
  Paper.list(function(err, papers) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(papers);
  });
});
router.post('/paperSubmit', function(req, res) {
  var formPaper = req.body.formPaper;

  var id = formPaper._id;
  var _paper;
  var promise = new Promise(function(resolve, reject) {
    if (id) {
      Paper.findById(id, function(err, paper) {
        formPaper.lastEditor = req.session.teacher._id;
        _paper = _.extend(paper, formPaper);
        resolve(true);
      });
    } else {
      formPaper.creator = req.session.teacher._id;
      _paper = new Paper(formPaper);
      resolve(true);
    }
  });

  promise.then(function(val) {
    _paper.save(function(err, paper) {
      if (err) {
        console.log(err);
        return;
      }
      res.json(paper);
    });
  });
});

// 组卷
router.get('/paper/compose/:id', function(req, res) {
  var id = req.params.id;
  res.render('./teacher/paper/compose', {
    title: '组卷',
    id: id
  });
});
router.get('/paper/getPaperInfo', function(req, res) {
  var id = req.query.id;
  Paper.findById(id, function(err, paper) {
    res.json(paper);
  });
});
router.post('/paper/composeSave', function(req, res) {
  var form = req.body.form;
  var id = req.body.id;

  Paper.update({ _id: id }, {
    $addToSet: {
      composes: form
    }
  }, function(err) {
    res.json(true);
  });
});
router.post('/paper/deleteCompose', function(req, res) {
  var pid = req.body.pid;
  var datetime = req.body.datetime;
  Paper.update({ _id: pid }, {
    $pull: {
      composes: {
        datetime: datetime
      }
    }
  }, function(err) {
    res.json(true);
  });
});
router.post('/paper/completeCompose', function(req, res) {
  var id = req.body.id;
  Paper.update({ _id: id }, {
    $set: {
      status: 2
    }
  }, function(err) {
    res.json(true);
  });
});

// 选题
router.get('/paper/topic/:id', function(req, res) {
  var id = req.params.id;
  res.render('./teacher/paper/topic', {
    title: '选题',
    id: id
  });
});
router.post('/paper/addTest', function(req, res) {
  var pid = req.body.paper;
  var compose = req.body.compose;
  var test = req.body.test;

  Paper.update({
    _id: pid,
    'composes._id': compose
  }, {
    $push: { 'composes.$.tests': test }
  }, function(e, r) {
    res.json(true);
  });
});
router.post('/paper/delTest', function(req, res) {
  var pid = req.body.paper;
  var compose = req.body.compose;
  var test = req.body.test;

  Paper.update({
    _id: pid,
    'composes._id': compose
  }, {
    $pull: { 'composes.$.tests': test }
  }, function(e, r) {
    res.json(true);
  });
});
router.post('/paper/completeTopic', function(req, res) {
  var id = req.body.id;
  Paper.update({ _id: id }, {
    $set: {
      status: 3
    }
  }, function(err, result) {
    res.json(true);
  });
});

module.exports = router;
