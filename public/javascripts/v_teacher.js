var vm = new Vue({
  el: '#testCtrl',
  ready: function() {

    // 获取科目选项
    this.$http.get('/teacher/getSubjectList', {}, {}).then(function(subjects) {
      this.subjects = subjects.data;
      if (subjects.data.length > 0) this.testAttrs.subject = subjects.data[0]._id;

      // 获取题型选项
      this.$http.get('/teacher/getTestTypeList', {}, {}).then(function(types) {
        this.types = types.data;
        if (types.data.length > 0) this.testAttrs.type = types.data[0]._id;

        // 初始化现有题目数据
        this.getTestList();
      });
    });

  },
  data: {
    tests: [],
    subjects: [],
    types: [],
    inputType: 'checkbox',
    testAttrs: {
      subject: -1,
      type: -1,
      options_1: [{
        key: 'A',
        val: ''
      }, {
        key: 'B',
        val: ''
      }, {
        key: 'C',
        val: ''
      }, {
        key: 'D',
        val: ''
      }],
      options_2: [{
        key: 'A',
        val: '正确'
      }, {
        key: 'B',
        val: '错误'
      }]
    },
    modal: {
      title: '',
      form: {
        _id: undefined,
        title: '',
        options: [],
        result: [],
        analyze: '',
        type: '',
        subject: ''
      }
    }
  },
  methods: {
    getTestList: function() {
      var query = {
        subject: this.testAttrs.subject,
        type: this.testAttrs.type
      };
      this.$http.get('/teacher/getTestList', { params: query }, {}).then(function(res) {
        this.tests = res.data;
      });
    },
    findOneAndUpdate: function(id, model) {
      this.tests.forEach(function(v, k) {
        if (v._id === id) {
          v.title = model.title;
          v.options = model.options;
          v.result = model.result;
          v.analyze = model.analyze;
        }
      });
    },
    getTypeName: function(typeId) {
      var name = '';
      this.types.forEach(function(v, k) {
        if (v._id === typeId) name = v.name;
      });
      return name;
    },
    resetForm: function() {
      this.modal.form = {
        _id: undefined,
        title: '',
        options: [],
        result: [],
        analyze: '',
        type: '',
        subject: ''
      };
    },
    getDefaultFormOptions: function() {
      var _this = this;
      var options;
      var typeName = this.getTypeName(this.testAttrs.type);
      switch (typeName) {
        case '单选题':
          options = _this.testAttrs.options_1;
          break;
        case '判断题':
          options = _this.testAttrs.options_2;
          break;
        case '多选题':
          options = _this.testAttrs.options_1;
          break;
      }
      return options;
    },
    formValid: function() {
      var flag = false;
      if (this.modal.form.title === '' || this.modal.form.title === undefined) flag = true;
      if (this.modal.form.result === '' || this.modal.form.result === undefined) flag = true;
      return flag;
    },
    submit: function() {
      var id = this.modal.form._id;
      this.$http.post('/teacher/testSubmit', { testForm: this.modal.form }, {}).then(function(res) {
        if (id) {
          this.findOneAndUpdate(id, res.data);
        } else {
          this.tests.unshift(res.data);
        }
        $('#newTestModal').modal('hide');
      });
    },
    create: function() {
      this.resetForm();
      this.modal.title = "发布新题（" + this.getTypeName(this.testAttrs.type) + ")";
      // 初始化选项格式
      this.modal.form.options = this.getDefaultFormOptions();
      // 科目，题型
      this.modal.form.subject = this.testAttrs.subject;
      this.modal.form.type = this.testAttrs.type;
      $('#newTestModal').modal();
    },
    edit: function(test) {
      console.log(test);
      // 禁用双向绑定
      this.modal.form = {
        _id: test._id.toString(),
        title: test.title.toString(),
        options: test.options.concat(),
        result: test.result.concat(),
        analyze: test.analyze.toString(),
        type: test.type.toString(),
        subject: test.subject.toString()
      };
      // 处理多选题选项多选bug
      this.modal.title = "编辑" + "[" + test.title + "]";
      $('#newTestModal').modal();
    },
    editSubmit: function(test) {
      test.isOnEdit = false;
    }
  }
});

new Vue({
  el: '#paperCtrl',
  ready: function() {
    // 获取科目列表
    this.$http.get('/teacher/getSubjectList', {}, {}).then(function(res) {
      this.subjects = res.data;
      this.modal.form.subject = this.subjects[0]._id;
    });
    // 获取试卷列表
    this.$http.get('/teacher/getPaperList', {}, {}).then(function(res) {
      this.papers = res.data;
    });
  },
  data: {
    subjects: [],
    papers: [],
    modal: {
      title: '',
      form: {
        _id: undefined,
        name: undefined,
        duration: undefined,
        points: undefined,
        subject: undefined
      }
    }
  },
  methods: {
    resetForm: function() {
      this.modal.form = {
        _id: undefined,
        name: undefined,
        duration: undefined,
        points: undefined,
        subject: this.subjects[0]._id
      };
    },
    formValid: function() {
      var flag = false;
      if (this.modal.form.name === undefined || this.modal.form.name === '') flag = true;
      if (this.modal.form.duration === undefined || this.modal.form.duration === '') flag = true;
      if (this.modal.form.points === undefined || this.modal.form.points === '') flag = true;
      if (this.modal.form.subject === undefined || this.modal.form.subject === '') flag = true;
      return flag;
    },
    create: function() {
      this.resetForm();
      this.modal.title = '创建新试卷';
      $('#newPaperModal').modal();
    },
    edit: function(model) {
      this.modal.form = {
        _id: model._id.toString(),
        name: model.name.toString(),
        duration: model.duration + 0,
        points: model.points + 0,
        subject: model.subject._id.toString()
      };
      $('#newPaperModal').modal();
    },
    submit: function() {
      var id = this.modal.form._id;
      this.$http.post('/teacher/paperSubmit', { formPaper: this.modal.form }, {}).then(function(res) {
        if (id) {
          this.findOneAndUpdate(id, res.data);
        } else {
          this.papers.unshift(res.data);
        }
        $('#newPaperModal').modal('hide');
      });
    },
    findOneAndUpdate: function(id, model) {
      var newSubject;
      this.subjects.forEach(function(v, k) {
        if (v._id === model.subject) newSubject = v;
      });
      this.papers.forEach(function(v, k) {
        if (v._id === id) {
          v.name = model.name;
          v.duration = model.duration;
          v.points = model.points;
          v.subject = newSubject;
        }
      });
    }
  }
});

new Vue({
  el: '#composeCtrl',
  ready: function() {
    // 试卷信息
    this.$http.get('/teacher/paper/getPaperInfo', { params: { id: this.id } }).then(function(res) {
      this.paper = res.data;
    });
    // 题型列表
    this.$http.get('/teacher/getTestTypeList', {}).then(function(res) {
      this.types = res.data;
    });
  },
  data: {
    id: $('#composeCtrl').attr('data-id'),
    paper: {},
    types: [],
    form: {
      ctype: undefined,
      value: undefined,
      number: undefined
    }
  },
  methods: {
    updateTypes: function(action, model) {
      if (action === 'remove') {
        this.types.forEach(function(v, k) {
          if (v._id === model._id) this.types.splice(k, 1);
        });
      } else if (action === 'add') {
        this.types.push(model);
      }
    },
    resetForm: function() {
      this.form = {
        value: undefined,
        number: undefined
      };
    },
    formValid: function() {
      if (this.form.ctype === undefined || this.form.ctype === '') return true;
      if (this.form.value === undefined || this.form.value === '') return true;
      if (this.form.number === undefined || this.form.number === '') return true;
      if ((this.form.value * this.form.number + this.nowPoints()) > this.paper.points) return true;
      return false;
    },
    submit: function() {
      var form = {
        ctype: this.form.ctype._id,
        value: this.form.value,
        number: this.form.number,
        datetime: Date.now()
      };
      this.$http.post('/teacher/paper/composeSave', { id: this.id, form: form }).then(function(res) {
        form.ctype = this.form.ctype;
        this.paper.composes.push(form);
        this.resetForm();
      });
    },
    delete: function(index, model) {
      this.$http.post('/teacher/paper/deleteCompose', { pid: this.id, datetime: model.datetime }).then(function(res) {
        this.paper.composes.splice(index, 1);
        this.resetForm();
      });
    },
    typeFilter: function() {
      var types = this.types.concat();
      if (this.paper.composes.length > 0) {
        this.paper.composes.forEach(function(v, k) {
          types.forEach(function(vv, kk) {
            if (v.ctype._id === vv._id) types.splice(kk, 1);
          });
        });
      }

      this.form.ctype = types[0];
      return types;
    },
    nowPoints: function() {
      var points = 0;
      this.paper.composes.forEach(function(v, k) {
        points += v.value * v.number;
      });
      return points;
    },
    complete: function() {
      this.$http.post('/teacher/paper/completeCompose', { id: this.id }).then(function(res) {
        location.href = '/teacher/paper';
      });
    }
  }
});


Array.prototype.inArray = function(key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) return true;
  }
  return false;
};

new Vue({
  el: '#topicCtrl',
  ready: function() {
    var _this = this;
    this.$http.get('/teacher/paper/getPaperInfo', { params: { id: this.id } }).then(function(res) {
      var paper = res.data;
      _this.compose = paper.composes[0];
      paper.composes.forEach(function(v, k) {
        Vue.set(v, 'isOpen', this.isOpen = true);
      });
      _this.paper = paper;
      _this.getTestListByType();
    });
  },
  data: {
    id: $('#topicCtrl').attr('data-id'),
    paper: undefined,
    tests: [],
    compose: {},
    isEnough: undefined
  },
  methods: {
    getTestListByType: function() {
      var _this = this;
      this.$http.get('/teacher/test/list', {
        params: {
          subject: this.paper.subject._id,
          type: this.compose.ctype._id
        }
      }).then(function(res) {
        var tests = res.data;
        var composeTests = [];
        var composeId = this.compose._id;

        // 获取试卷中的 当前所选的题型 的题目列表。并计算试卷中该题型的题目是否达到要求
        _this.paper.composes.forEach(function(v, k) {
          if (v._id === composeId) {
            composeTests = v.tests;
            _this.isEnough = (composeTests.length === v.number);
          }
        });
        // 遍历待选列表中每道题与试卷中现有题目进行对比，确定这道题是否已被添加
        tests.forEach(function(test, index) {
          test.isAdd = composeTests.inArray('_id', test._id);
        });

        _this.tests = tests;
      });
    },
    add: function(test) {
      console.log(test);
      var _this = this;
      var form = {
        paper: this.id,
        compose: this.compose._id,
        test: test._id
      };

      this.$http.post('/teacher/paper/addTest', form).then(function(res) {
        _this.paper.composes.forEach(function(v, k) {
          if (v._id === form.compose) {
            v.tests.push(test);
            _this.isEnough = (v.number === v.tests.length);
          }
        });
        test.isAdd = true;
      });
    },
    del: function(index, test, compose) {
      var _this = this;
      var composeId = this.compose._id;
      var form = {
        paper: this.id,
        compose: compose._id,
        test: test._id
      };
      this.$http.post('/teacher/paper/delTest', form).then(function(res) {
        compose.tests.splice(index, 1);
        if (form.compose !== composeId) return;
        _this.isEnough = false;
        _this.tests.forEach(function(v, k) {
          if (v._id === test._id) v.isAdd = false;
        });
      });
    },
    toggle: function(model) {
      model.isOpen = !model.isOpen;
    },
    validTopicComplete: function() {
      var flag = true;
      this.paper.composes.forEach(function(v, k) {
        if (v.tests.length !== v.number) flag = false;
      });
      return flag;
    },
    complete: function() {
      this.$http.post('/teacher/paper/completeTopic', { id: this.id }).then(function(res) {
        location.href = '/teacher/test';
      });
    }
  }
});

Vue.filter('inputType', function(type) {
  var inputType = 'radio';
  this.types.forEach(function(v, k) {
    if (v._id === type && v.name === '多选题') inputType = 'checkbox';
  });
  return inputType;
});

Vue.filter('paperStatus', function(status) {
  var s = '';
  switch (status) {
    case 1:
      s = '初始化完成';
      break;
    case 2:
      s = '组卷完成';
      break;
    case 3:
      s = '完成';
      break;
    case -1:
      s = '已删除';
      break;
  }
  return s;
});

Vue.filter('convertNumber', function(val) {
  var arr = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return arr[val] || '';
});