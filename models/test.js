var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: ObjectId,
    ref: 'TestType'
  },
  subject: {
    type: ObjectId,
    ref: 'Subject'
  },
  author: {
    type: ObjectId,
    ref: 'Teacher'
  },
  options: [], // {key:A, val: are you ok?}
  result: [],
  analyze: String,
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

TestSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

TestSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .sort({ 'meta.createAt': -1 })
      .exec(cb);
  },
  search: function(query, cb) {
    return this
      .find(query)
      .sort({ 'meta.createAt': -1 })
      .exec(cb);
  },
  findById: function(id, cb) {
    return this
      .findOne({
        _id: id
      })
      .exec(cb);
  }
};

module.exports = mongoose.model('Test', TestSchema);