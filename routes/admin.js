var express = require('express');
var _ = require('underscore');
var router = express.Router();

var Admin = require('../models/admin');
var TestType = require('../models/testType');
var Subject = require('../models/subject');
var Exam = require('../models/exam');
var Paper = require('../models/paper');
var Notice = require('../models/notice');

router.get('*',function (req,res,next) {
  var admin = req.session.admin || null;
  res.locals.admin = admin;
  var url = req.url;
  if (['/account/signin', '/account/signup'].indexOf(url) !== -1) {
    next();
  } else {
    if (!admin) return res.redirect('/admin/account/signin');
    next();
  }
});

router.get('/', function(req, res) {
  res.redirect('/admin/testType');
});

// 管理员登录
router.get('/account/signin',function (req,res) {
  res.render('./admin/account/signin',{
    title: '管理员登录'
  });
});
router.post('/account/signin',function (req,res) {
  var email = req.body.email,
    pwd = req.body.pwd;
  Admin.findOne({email:email},function (err,admin) {
    if (err) {
      console.log(err);
      return;
    }
    if (!admin) return res.redirect('/admin/account/signin');
    admin.validPwd(pwd,function (result) {
      if (!result) return res.redirect('/admin/account/signin');
      req.session.admin = admin;
      res.redirect('/admin');
    });
  });
});

// 管理员注册
router.get('/account/signup',function (req,res) {
  res.render('./admin/account/signup',{
    title: '管理员注册'
  });
});
router.post('/account/signup',function (req,res) {
  var email = req.body.email,
    pwd = req.body.pwd;
  var _admin = new Admin({email:email,pwd:pwd});
  _admin.save(function (err,admin) {
    req.session.admin = admin;
    res.redirect('/admin');
  });
});

// 账户登出
router.get('/account/signout',function (req,res) {
  delete req.session.admin;
  res.redirect('/admin');
});

// 题型管理
router.get('/testType', function(req, res) {
  TestType.list(function(err, types) {
    res.render('./admin/type/list', {
      title: '题型管理',
      types: types
    });
  });
});
router.get('/testType/create', function(req, res) {
  res.render('./admin/type/create', {
    title: '添加题型'
  });
});
router.post('/testType/create', function(req, res) {
  var formType = req.body.type;
  var _type = new TestType(formType);
  _type.save(function(err, type) {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/admin/testType');
  });
});

// 科目管理
router.get('/subject', function(req, res) {
  Subject.list(function(err, subjects) {
    res.render('./admin/subject/list', {
      title: '科目列表',
      subjects: subjects
    });
  });
});
router.get('/subject/list', function(req, res) {
  Subject.find({}, function(err, subjects) {
    res.json(subjects);
  });
});
router.get('/subject/create', function(req, res) {
  res.render('./admin/subject/create', {
    title: '添加科目'
  });
});
router.post('/subject/create', function(req, res) {
  var formSubject = req.body.subject;
  var _subject = new Subject(formSubject);
  _subject.save(function(err, subject) {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/admin/subject');
  });
});

// 考试管理
router.get('/exam', function(req, res) {
  res.render('./admin/exam/index', {
    title: '考试记录'
  });
});
router.get('/exam/list', function(req, res) {
  Exam.find({}).populate(
    'paper', { name: 1 }
  ).exec(function(err, exams) {
    res.json(exams);
  });
});
router.post('/exam/save', function(req, res) {
  var form = req.body.form;
  var formObj = {
    name: form.name,
    paper: form.paper,
    times: {
      beginTime: form.beginTime,
      endTime: form.endTime
    }
  };
  var _exam;
  var promise = new Promise(function(resolve, reject) {
    if (form._id) {
      Exam.findOne({ _id: form._id }, function(err, exam) {
        _exam = _.extend(exam, formObj);
        resolve(true);
      });
    } else {
      _exam = new Exam(formObj);
      resolve(true);
    }
  });

  promise.then(function(v) {
    _exam.save(function(err, exam) {
      res.json(exam);
    });
  });
});
router.post('/exam/status',function (req,res) {
  var id = req.body._id,
    status = req.body.status;
  Exam.update({_id: id}, {$set: {
    status: status
  }},function (err) {
    res.json(true);
  });
});
router.get('/exam/getPaper', function(req, res) {
  var subject = req.query.subject;
  console.log(subject);
  Paper.search({ subject: subject }, function(err, papers) {
    res.json(papers);
  });
});

// 公告管理
router.get('/notice',function (req,res) {
  res.render('./admin/notice/index',{
    title: '考试公告'
  });
});
router.get('/notice/list',function (req,res) {
  Notice.find({}).exec(function (err,notices) {
    res.json(notices);
  });
});
router.post('/notice/save',function (req,res) {
  var form = req.body.form;
  var admin = req.session.admin._id;
  var _notice;

  if (form._id) {
    Notice.update({_id: form._id},{
      $set: {
        title: form.title,
        content: form.content
      }
    },function (err) {
      res.json(true);
    });
  } else {
    form.author = admin;
    _notice = new Notice(form);
    _notice.save(function (err,notice) {
      res.json(notice);
    });
  }
});
router.post('/notice/remove',function (req,res) {
  var id = req.body._id;
  Notice.remove({_id: id},function (err) {
    res.json(true);
  });
});

module.exports = router;
