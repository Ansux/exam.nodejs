new Vue({
  el: '#exam_create_ctrl',
  data: {
    subject: '-1',
    papers: [],
    paper: undefined
  },
  methods: {
    getPaper: function() {
      if (this.subject === '-1') return;
      this.$http.get('/admin/exam/getPaper', { params: { subject: this.subject } }).then(function(res) {
        this.papers = res.data;
        if (res.data.length > 0) this.paper = res.data[0]._id;
      });
    }
  }
});