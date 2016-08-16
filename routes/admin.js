var express = require('express');
var router = express.Router();

var TestType = require('../models/testType');
var Subject = require('../models/subject');

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

module.exports = router;