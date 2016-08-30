var express = require('express');
var router = express.Router();

var Student = require('../models/student');
var Exam = require('../models/exam');
var Paper = require('../models/paper');
var StuExam = require('../models/stuExam');

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

// 考试中心
router.get('/exam', function(req, res) {
  Exam.find({}, function(err, exams) {
    res.render('./student/exam/index', {
      title: '考试中心',
      exams: exams
    });
  });
});

router.get('/exam/detailJson', function(req, res) {
  var id = req.query.id;
  var student = req.session.student._id;
  console.log(id);
  var promise = new Promise(function(resolve, reject) {
    StuExam.findOne({ exam: id, student: student }, function(err, stuExam) {
      if (stuExam === null) {
        var _stuExam = new StuExam({
          student: student,
          exam: id
        });
        _stuExam.save(function(err, stuExam) {
          resolve(null);
        });
      } else {
        resolve(stuExam);
      }
    });
  });

  promise.then(function(stuExam) {
    Exam.findOne({ _id: id }, function(err, exam) {
      Paper.findOne({ _id: exam.paper }).populate('subject', {
        'name': 1
      }).populate('composes.ctype', {
        'name': 1
      }).populate('composes.tests', {
        'title': 1,
        'options': 1
      }).exec(function(err, paper) {
        res.json({ exam: exam, paper: paper, stuExam: stuExam });
      });
    });
  });

});

// 正在考试
router.get('/tesing/:id', function(req, res) {
  res.render('./student/exam/tesing', {
    title: '正在考试',
    id: req.params.id
  });
});
router.post('/testing/answer', function(req, res) {
  var exam = req.body.exam;
  var tid = req.body.tid;
  var answer = req.body.answer;
  console.log(exam);
});

module.exports = router;