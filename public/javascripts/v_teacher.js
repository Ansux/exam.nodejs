var vm = new Vue({
  el: '#testCtrl',
  ready: function() {
    // 初始化现有题目数据
    this.$http.get('/teacher/getTestList', {}, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      },
      emulateJSON: true
    }).then(function(res) {
      this.tests = res.data;
    });
    // 获取科目选项
    this.$http.get('/teacher/getSubjectList', {}, {}).then(function(res) {
      this.subjects = res.data;
      if (res.data.length > 0) this.testAttrs.subject = res.data[0]._id;
    });
    // 获取题型选项
    this.$http.get('/teacher/getTestTypeList', {}, {}).then(function(res) {
      this.types = res.data;
      if (res.data.length > 0) this.testAttrs.type = res.data[0]._id;
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
      if (this.modal.form.title === '') flag = true;
      if (this.modal.form.result === '') flag = true;
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

Vue.filter('inputType', function(type) {
  var inputType = 'radio';
  this.types.forEach(function(v, k) {
    if (v._id === type && v.name === '多选题') inputType = 'checkbox';
  });
  return inputType;
});