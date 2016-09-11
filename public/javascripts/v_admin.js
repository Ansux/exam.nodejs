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
    status: function (model,index) {
      var confirmMsg = '',
        status;
      if (model.status === 1) {
        confirmMsg = '确定要锁定本场考试么？\r[ 警告：锁定后将不允许变更考试内容 ]';
        status = 2;
      } else if (model.status === 2) {
        confirmMsg = '确定要开放查询考试明细的权限么？\r[ 警告：开放后将学生用户将可查看考卷答案 ]';
        status = 3;
      }
      if (confirm(confirmMsg)) {
        this.$http.post('/admin/exam/status',{_id: model._id, status: status}).then(function (res) {
          this.exams[index].status = status;
        });
      }
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
  },
  filters: {
    parseStatus: function(status) {
      var txt = '';
      if (status === -1) txt = '作废';
      else if (status === 1) txt = '初始化';
      else if (status === 2) txt = '锁定';
      else if (status === 3) txt = '开放查询';
      return txt;
    },
    statusBtnText: function (status) {
      var txt = '';
      if (status === -1) txt = '启用';
      else if (status === 1) txt = '锁定';
      else if (status === 2) txt = '开发查询';
      return txt;
    },
    parseProgress: function(model) {
      var now = (new Date()).getTime();
      var beginTime = (new Date(model.times.beginTime)).getTime();
      var endTime = (new Date(model.times.endTime)).getTime();

      if (now > endTime) return '已结束';
      if (now < beginTime) return '待考中';
      else return '正在考试';
    }
  }
});

new Vue({
  el: '#notice_ctrl',
  ready: function () {
    this.$http.get('/admin/notice/list',{}).then(function (res) {
      this.notices = res.data;
    });
  },
  data: {
    notices: [],
    modal: {
      title: null,
      form: {
        _id: undefined,
        title: undefined,
        content: '',
      }
    }
  },
  methods: {
    resetForm: function () {
      this.modal.form = {
        _id: undefined,
        title: null,
        content: '',
      };
    },
    create: function () {
      this.modal.title = '发布公告';
      this.resetForm();
      $('#modal_notice').modal();
    },
    edit: function (model) {
      this.modal = {
        title: '更新公告 <' + model.title + '>',
        form: {
          _id: model._id,
          title: model.title,
          content: model.content
        }
      };
      $('#modal_notice').modal();
    },
    remove: function (id,index) {
      if (confirm('确定要删除此公告么？')) {
        this.$http.post('/admin/notice/remove',{_id: id}).then(function (res) {
          this.notices.splice(index,1);
        });
      }
    },
    submit: function () {
      var form = this.modal.form;
      this.$http.post('/admin/notice/save',{form:form}).then(function (res) {
        if (form._id) {
          this.notices.forEach(function (v,k) {
            if (v._id === form._id) {
              v.title = form.title;
              v.content = form.content;
            }
          });
        } else {
          this.notices.unshift(res.data);
        }
        this.resetForm();
        $('#modal_notice').modal('hide');
      });
    }
  },
  filters: {
    marked: marked
  }
});

Vue.filter('parseDate', function(d, format) {
  return moment(d).format(format);
});
