var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  paper: {
    type: ObjectId,
    ref: 'Paper'
  },
  status: {
    // 1.初始化，2.锁定，-1.作废
    type: Number,
    default: 1
  },
  times: {
    beginTime: Date,
    endTime: Date
  },
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

ExamSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

ExamSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .exec(cb);
  },
  findById: function(id, cb) {
    return this
      .findOne({
        _id: id
      })
      .exec(cb);
  },
  search: function(query, cb) {
    return this
      .find(query)
      .exec(cb);
  }
};

module.exports = mongoose.model('Exam', ExamSchema);