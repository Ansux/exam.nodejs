var express = require('express');
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
  Exam.list(function(err, exams) {
    res.render('./admin/exam/index', {
      title: '考试记录',
      exams: exams
    });
  });
});
router.get('/exam/create', function(req, res) {
  Subject.list(function(err, subjects) {
    res.render('./admin/exam/create', {
      title: '添加考试',
      subjects: subjects
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
router.post('/exam/save', function(req, res) {
  var id = req.body.id;
  var form = req.body.exam;
  if (id) {
    Exam.update({ _id: id }, {
      $set: {
        name: form.name,
        paper: form.paper,
        meta: {
          beginTime: form.beginTime,
          endTime: form.endTime
        }
      }
    }, function(err, result) {
      res.json(true);
    });
  } else {
    var _exam = new Exam({
      name: form.name,
      paper: form.paper,
      status: 1,
      meta: {
        beginTime: form.beginTime,
        endTime: form.endTime
      }
    });
    _exam.save(function(err, exam) {
      res.json(exam);
    });
  }
});

module.exports = router;