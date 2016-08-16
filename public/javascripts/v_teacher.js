var vm = new Vue({
  el: '#testCtrl',
  ready: function() {
    this.$http.get('/teacher/test/list', {}, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      },
      emulateJSON: true
    }).then(function(res) {
      this.tests = res.data;
    });
  },
  data: {
    tests: []
  },
  methods: {

  }
});