var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var StuExamSchema = new mongoose.Schema({
  student: {
    type: ObjectId,
    ref: 'Student'
  },
  exam: {
    type: ObjectId,
    ref: 'Exam'
  },
  examRecord: [],
  score: Number,
  times: {
    beginTime: {
      type: Date,
      default: Date.now()
    },
    endTime: Date
  }
});

StuExamSchema.statics = {
  findByExam: function(eid, cb) {
    return this
      .find({
        exma: eid
      })
      .sort('times.endTime')
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
      .findOne(query)
      .exec(cb);
  }
};

module.exports = mongoose.model('StuExam', StuExamSchema);
