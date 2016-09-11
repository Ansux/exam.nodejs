var express = require('express');
var router = express.Router();

var Student = require('../models/student');
var Exam = require('../models/exam');
var Paper = require('../models/paper');
var StuExam = require('../models/stuExam');
var Notice = require('../models/notice');

// 登录过滤器
/**
router.get("*", function(req, res, next) {
  var student = req.session.student || null;
  res.locals.student = student;
  var url = req.url;

  if (['/account/signin', '/account/signup'].indexOf(url) !== -1) {
    next();
  } else {
    if (!student) return res.redirect('/account/signin');
    next();
  }
});
**/

// 登录权限验证
function signinFilter(req, res) {
  var student = req.session.student || null;
  res.locals.student = student;
  if (!student) return res.redirect('/account/signin');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  signinFilter(req, res);
  Notice.find({}).exec(function(err, notices) {
    res.render('./student/dashboard', {
      title: '首页',
      notices: notices
    });
  });
});

// 学生登录
router.get('/account/signin', function(req, res) {
  if (req.session.student) return res.redirect('/');
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
  signinFilter(req, res);

  var student = req.session.student._id;
  Exam.find({
    'times.endTime': {
      '$lte': new Date()
    }
  }, function(err, exams) {
    StuExam.find({
      student: student
    }, function(err, stuExams) {
      res.render('./student/exam/index',{
        title: '考试记录',
        exams: exams,
        stuExams: stuExams
      });
    });
  });
});

router.get('/examJson', function(req, res) {
  var student = req.session.student._id;

  Exam.find({
    'times.endTime': {
      '$gte': new Date()
    }
  }, function(err, exams) {
    StuExam.find({
      student: student
    }, function(err, stuExams) {
      res.json({
        exams: exams,
        stuExams: stuExams
      });
    });
  });
});

router.get('/exam/detailJson', function(req, res) {
  var id = req.query.id;
  var student = req.session.student._id;

  var promise = new Promise(function(resolve, reject) {
    StuExam.findOne({
      exam: id,
      student: student
    }, function(err, stuExam) {
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
    Exam.findOne({
      _id: id
    }, function(err, exam) {
      Paper.findOne({
          _id: exam.paper
        })
        .select('subject composes')
        .populate('subject', {
          'name': 1
        }).populate('composes.ctype', {
          'name': 1
        }).populate('composes.tests', {
          'title': 1,
          'options': 1
        }).exec(function(err, paper) {
          res.json({
            exam: exam,
            paper: paper,
            stuExam: stuExam
          });
        });
    });
  });

});

// 正在考试
router.get('/tesing/:id', function(req, res) {
  signinFilter(req, res);
  res.render('./student/exam/tesing', {
    title: '正在考试',
    id: req.params.id
  });
});
router.post('/testing/submit', function(req, res) {
  var stuExam = req.body.stuExam;
  var student = req.session.student._id;

  var endTime = Date.now();
  var promise = new Promise(function(resolve, reject) {
    Exam.findOne({
        _id: stuExam.exam
      })
      .select('paper')
      .exec(function(err, exam) {
        Paper.findOne({
            _id: exam.paper
          })
          .select('composes')
          .populate('composes.tests', {
            'result': 1
          }).exec(function(err, paper) {
            var points = 0;
            paper.composes.forEach(function(compose, k) {
              compose.tests.forEach(function(test, k) {
                stuExam.tests.forEach(function(set, k) {
                  if (set._id == test._id && set.answer.join("") === test.result.join("")) {
                    points += compose.value;
                  }
                });
              });
            });
            resolve(points);
          });
      });
  });

  promise.then(function(result) {
    StuExam.findOne({
      student: student,
      exam: stuExam.exam
    }, function(err, se) {
      se.score = result;
      se.times.endTime = endTime;
      se.examRecord = stuExam.tests;
      se.save(function(err, seRes) {
        res.json(seRes);
      });
    });
  });
});

// 考试成绩
router.get('/stuExam/score/:exam', function(req, res) {
  signinFilter(req, res);
  var exam = req.params.exam;
  var student = req.session.student._id;
  StuExam.findOne({
    exam: exam,
    student: student
  }).populate('student', {
    'email': 1
  }).populate('exam', {
    'name': 1
  }).exec(function(err, stuExam) {
    res.render('./student/exam/score', {
      title: '考试成绩',
      stuExam: stuExam
    });
  });
});

// 考试详情
router.get('/stuExam/detail/:id', function(req, res) {
  signinFilter(req, res);
  res.render('./student/exam/stuExam', {
    title: '考试详情',
    id: req.params.id
  });
});
router.get('/stuExam/detailJson', function(req, res) {
  var exam = req.query.exam;
  var student = req.session.student._id;

  var promise = new Promise(function(resolve, reject) {
    StuExam.findOne({
      exam: exam,
      student: student
    }).populate('student', {
      'email': 1
    }).exec(function(err, stuExam) {
      resolve(stuExam);
    });
  });

  promise.then(function(stuExam) {
    Exam.findOne({
      _id: exam
    }, function(err, exam) {
      Paper.findOne({
          _id: exam.paper
        })
        .select('subject composes')
        .populate('subject', {
          'name': 1
        }).populate('composes.ctype', {
          'name': 1
        }).populate('composes.tests', {
          'title': 1,
          'options': 1,
          'result': 1
        }).exec(function(err, paper) {
          res.json({
            exam: exam,
            paper: paper,
            stuExam: stuExam
          });
        });
    });
  });
});

// 考试公告
router.get('/notice', function(req, res) {
  Notice.find({}, function(err, notices) {
    res.render('./student/notice/index', {
      title: '考试公告',
      notices: notices
    });
  });
});

module.exports = router;
