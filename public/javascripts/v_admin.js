new Vue({
  el: '#exam_ctrl',
  ready: function() {
    this.$http.get('/admin/exam/list', {}).then(function(res) {
      this.exams = res.data;
    });
  },
  data: {
    exams: [],
    papers: [],
    subjects: [],
    subject: -1,
    modal: {
      title: null,
      form: {
        _id: null,
        name: null,
        paper: -1,
        beginTime: null,
        endTime: null
      }
    }
  },
  methods: {
    resetData: function() {
      this.subject = -1;
      this.papers = [];
      this.modal.form = {
        _id: null,
        name: null,
        paper: -1,
        beginTime: null,
        endTime: null
      };
    },
    getSubject: function() {
      this.$http.get('/admin/subject/list', {}).then(function(res) {
        this.subjects = res.data;
      });
    },
    getPaper: function() {
      if (parseInt(this.subject) === -1) {
        this.modal.form.paper = -1;
        this.papers = [];
      } else {
        this.$http.get('/admin/exam/getPaper', { params: { subject: this.subject } }).then(function(res) {
          this.papers = res.data;
          this.modal.form.paper = res.data[0]._id;
        });
      }
    },
    create: function() {
      if (this.subjects.length === 0) this.getSubject();
      $('#modal_exam_create').modal();
    },
    edit: function(model) {
      this.subject = -1;
      if (this.subjects.length === 0) this.getSubject();
      this.papers = [{
        _id: model.paper._id,
        name: model.paper.name
      }];

      this.modal.form = {
        _id: model._id,
        name: model.name,
        paper: model.paper._id,
        beginTime: moment(model.times.beginTime).format('YYYY-MM-DDTHH:mm:ss'),
        endTime: moment(model.times.endTime).format('YYYY-MM-DDTHH:mm:ss')
      };

      $('#modal_exam_create').modal();
    },
    validForm: function() {
      if (!this.modal.form.name) return true;
      if (!this.modal.form.paper) return true;
      if (!this.modal.form.beginTime) return true;
      if (!this.modal.form.endTime) return true;
      if (this.modal.form.endTime < this.modal.form.beginTime) return true;
      return false;
    },
    update: function(exam) {
      this.exams.forEach(function(v, k) {
        if (v._id === exam._id) {
          v.name = exam.name;
          v.paper = exam.paper;
          v.times = exam.times;
          v.status = exam.status;
          return;
        }
      });
    },
    findPaperById: function(id) {
      var paper = {};
      this.papers.forEach(function(v, k) {
        if (v._id === id) paper = {
          _id: v._id,
          name: v.name
        };
      });
      return paper;
    },
    submit: function() {
      // 解决 datetime-local转datetime错误
      var form = {
        _id: this.modal.form._id,
        name: this.modal.form.name,
        paper: this.modal.form.paper,
        beginTime: this.modal.form.beginTime.replace('T', ' '),
        endTime: this.modal.form.endTime.replace('T', ' ')
      };

      this.$http.post('/admin/exam/save', { form: form }).then(function(res) {
        var exam = res.data;
        exam.paper = this.findPaperById(exam.paper);
        if (form._id) {
          this.update(exam);
        } else {
          this.exams.push(exam);
        }
        $('#modal_exam_create').modal('hide');
      });
    }
  }
});

Vue.filter('parseStatus', function(status) {
  var txt = '';
  if (status === -1) txt = '作废';
  else if (status === 1) txt = '启用';
  else if (status === 2) txt = '锁定';
  return txt;
});

Vue.filter('parseProgress', function(model) {
  var now = (new Date()).getTime();
  var beginTime = (new Date(model.times.beginTime)).getTime();
  var endTime = (new Date(model.times.endTime)).getTime();

  if (now > endTime) return '已结束';
  if (now < beginTime) return '待考中';
  else return '正在考试';
});

Vue.filter('parseDate', function(d, format) {
  return moment(d).format(format);
});