var express = require('express');
var _ = require('underscore');
var router = express.Router();

var TestType = require('../models/testType');
var Subject = require('../models/subject');
var Exam = require('../models/exam');
var Paper = require('../models/paper');

router.get('/', function(req, res) {
  res.redirect('/admin/testType');
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
router.get('/exam/getPaper', function(req, res) {
  var subject = req.query.subject;
  console.log(subject);
  Paper.search({ subject: subject }, function(err, papers) {
    res.json(papers);
  });
});

module.exports = router;