Array.prototype.getIndexByKey = function(key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) return i;
  }
  return -1;
};

new Vue({
  el: '#exam_ctrl',
  ready: function() {
    this.$http.get('/examJson', {}).then(function(res) {
      var exams = res.data.exams;
      var stuExams = res.data.stuExams;
      var now = new Date();
      exams.forEach(function(exam, k) {
        stuExams.forEach(function(stuExam, k) {
          if (exam._id == stuExam.exam) {
            exam.isBegin = true;
            if (stuExam.score) exam.isSubmit = true;
          }
        });

        // 时间状态
        var beginTime = new Date(exam.times.beginTime),
          endTime = new Date(exam.times.endTime);
        if (beginTime > now) {
          exam.timeStatus = '待考中';
        } else if (endTime > now) {
          exam.timeStatus = '正在考试';
        } else {
          exam.timeStatus = '考试结束';
        }

        // 考试时间字符串
        exam.timeString = moment(exam.times.beginTime).format('YYYY-MM-DD (HH:mm - ') + moment(exam.times.endTime).format('HH:mm)');
      });
      this.exams = exams;
    });
  },
  data: {
    exams: null
  },
  methods: {}
});

new Vue({
  el: '#testing_ctrl',
  ready: function() {
    this.$http.get('/exam/detailJson', {
      params: {
        id: this.id
      }
    }).then(function(res) {
      this.exam = res.data.exam;
      var paper = res.data.paper;
      this.clock();

      var _this = this;

      this.stuExam = JSON.parse(localStorage.getItem('stuExam'));
      if (this.stuExam === null) {
        var stuExamJson = {
          exam: this.id,
          tests: []
        };
        localStorage.setItem('stuExam', JSON.stringify(stuExamJson));
        this.stuExam = stuExamJson;

        paper.composes.forEach(function(compose, k) {
          compose.tests.forEach(function(t, k) {
            t.answer = [];
          });
        });
      } else {
        paper.composes.forEach(function(compose, k) {
          compose.tests.forEach(function(t, k) {
            _this.stuExam.tests.forEach(function(test, k) {
              if (t._id === test._id) t.answer = test.answer;
            });
            if (!t.answer) t.answer = [];
          });
        });
      }
      this.paper = paper;
    });
  },
  data: {
    id: $('#testing_ctrl').attr('data-id'),
    exam: null,
    paper: null,
    stuExam: null,
    clockTime: null,
    fixedFlag: false
  },
  computed: {
    testCount: function() {
      var count = 0;
      this.paper.composes.forEach(function(compose, k) {
        count += compose.tests.length;
      });
      return count;
    },
    doneCount: function() {
      return this.stuExam.tests.length;
    },
    scrollFixed: function() {
      window.onscroll = function() {
        var t = document.documentElement.scrollTop || document.body.scrollTop;
        this.fixedFlag = (t > 200);
      }.bind(this);
      return this.fixedFlag;
    }
  },
  methods: {
    examTimes: function(times) {
      return moment(times.beginTime).format('YYYY-MM-DD (HH:mm-') + moment(times.endTime).format('HH:mm)');
    },
    testAnswer: function(test) {
      var answer = $.isArray(test.answer) ? test.answer : [test.answer];
      answer = answer.length > 1 ? answer.sort() : answer;
      var stuExam = this.stuExam;
      if (stuExam.tests.length === 0) {
        stuExam.tests.push({
          _id: test._id,
          answer: answer
        });
      } else {
        var index = stuExam.tests.getIndexByKey('_id', test._id);
        if (index === -1) {
          stuExam.tests.push({
            _id: test._id,
            answer: answer
          });
        } else {
          stuExam.tests[index].answer = answer;
        }
      }
      localStorage.setItem('stuExam', JSON.stringify(stuExam));
    },
    clock: function() {
      var _this = this;

      function add0(num) {
        return num > 9 ? num : ('0' + num);
      }
      var endTime = (new Date(this.exam.times.endTime)).getTime();
      setInterval(function() {
        var now = (new Date()).getTime();
        var offset = endTime - now;
        var hh = parseInt(offset / (1000 * 60 * 60) % 24, 10);
        var mm = parseInt(offset / (1000 * 60) % 60, 10);
        var ss = parseInt(offset / 1000 % 60, 10);
        _this.clockTime = (add0(hh) + ':' + add0(mm) + ':' + add0(ss)) || '00:00:00';

        // 考试结束时间到，自动提交试卷
        if (offset <= 0) _this.submit();
      }, 500);
    },
    locate: function(id) {
      $('html,body').animate({
        scrollTop: $('#t_' + id).offset().top - 20
      }, 1000);
    },
    submit: function() {
      var txt = '';
      if (this.doneCount < this.testCount) {
        txt = '还有' + (this.testCount - this.doneCount) + '题没做，';
      }
      txt += '确定提交试卷么？';
      if (confirm(txt)) {
        this.$http.post('/testing/submit', {
          stuExam: this.stuExam
        }).then(function(res) {
          location.href = '/stuExam/score/' + this.id;
        });
      }
    }
  }
});

new Vue({
  el: '#stuExam_ctrl',
  ready: function() {
    this.$http.get('/stuExam/detailJson', {
      params: {
        exam: this.id
      }
    }).then(function(res) {
      this.exam = res.data.exam;
      var paper = res.data.paper;
      var stuExam = this.stuExam = res.data.stuExam;

      paper.composes.forEach(function(compose, k) {
        compose.tests.forEach(function(t, k) {
          stuExam.examRecord.forEach(function(test, k) {
            if (t._id === test._id) t.answer = test.answer;
          });
          if (!t.answer) t.answer = [];
        });
      });

      this.paper = paper;
    });
  },
  data: {
    id: $('#stuExam_ctrl').attr('data-id'),
    exam: null,
    paper: null,
    stuExam: null,
  },
  computed: {
    timeString: function () {
      if (this.exam) {
        return moment(this.exam.times.beginTime).format('YYYY-MM-DD (HH:mm - ') + moment(this.exam.times.endTime).format('HH:mm)');
      }
    }
  },
  methods: {

  }
});

Vue.filter('parseZHNum', function(val) {
  var arr = ['一', '二', '三', '四', '五', '六'];
  return arr[val] || '';
});
