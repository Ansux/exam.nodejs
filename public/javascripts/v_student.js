Array.prototype.getIndexByKey = function(key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) return this[i];
  }
  return -1;
};

new Vue({
  el: '#testing_ctrl',
  ready: function() {
    this.$http.get('/exam/detailJson', { params: { id: this.id } }).then(function(res) {
      this.exam = res.data.exam;
      var paper = res.data.paper;
      this.clock();

      this.stuExam = JSON.parse(localStorage.getItem('stuExam'));
      if (this.stuExam === null) {
        var stuExamJson = { exam: this.id, tests: [] };
        localStorage.setItem('stuExam', JSON.stringify(stuExamJson));
        this.stuExam = stuExamJson;
      } else {
        if (this.stuExam.tests.length > 0) {
          this.stuExam.tests.forEach(function(test, k) {
            paper.composes.forEach(function(compose, k) {
              compose.tests.forEach(function(t, k) {
                if (t._id === test._id) t.answer = test.answer;
              });
            });
          });
        }
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
    testAnswer: function(tid, answer) {
      var stuExam = this.stuExam;
      if (stuExam.tests.length === 0) {
        stuExam.tests.push({
          _id: tid,
          answer: answer
        });
      } else {
        var index = stuExam.tests.getIndexByKey('_id', tid);
        if (index === -1) {
          stuExam.tests.push({ _id: tid, answer: answer });
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
      }, 500);
    },
    locate: function(id) {
      console.log(id);
      $('html,body').animate({ scrollTop: $('#t_' + id).offset().top - 20 }, 1000);
    },
    submit: function() {
      var txt = '';
      if (this.doneCount < this.testCount) {
        txt = '还有' + (this.testCount - this.doneCount) + '题没做，';
      }
      txt += '确定提交试卷么？';
      if (confirm(txt)) {
        console.log(this.stuExam);
      }
    }
  }
});

Vue.filter('parseZHNum', function(val) {
  var arr = ['一', '二', '三', '四', '五', '六'];
  return arr[val] || '';
});