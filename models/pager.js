var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var PagerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    default: 1
  },
  subject: {
    type: ObjectId,
    ref: 'Subject'
  },
  composes: [{
    ctype: {
      type: ObjectId,
      ref: 'TestType'
    },
    value: Number,
    number: Number,
    tests: [{
      type: ObjectId,
      ref: 'Test'
    }]
  }],
  creator: {
    type: ObjectId,
    ref: 'Teacher'
  },
  editLogs: [],
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

PaperSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
    this.editLogs = [{
      editor: this.creator,
      datetime: Date.now()
    }];
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

PaperSchema.static = {
  list: function(cb) {
    return this
      .find({})
      .sort('meta.createAt')
      .exec(cb);
  },
  search: function(query, cb) {
    return this
      .find(query)
      .sort('meta.createAt')
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

module.exports = mongoose.model('Paper', PagerSchema);
