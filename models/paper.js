var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var PaperSchema = new mongoose.Schema({
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
  status: Number,
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
    datetime: Date,
    tests: [{
      type: ObjectId,
      ref: 'Test'
    }]
  }],
  creator: {
    type: ObjectId,
    ref: 'Teacher'
  },
  lastEditor: {
    type: ObjectId,
    ref: 'Teacher'
  },
  editLogs: [{
    editor: {
      type: ObjectId,
      ref: 'Teacher'
    },
    datetime: Date
  }],
  isDeleted: Boolean,
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

PaperSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
    this.isDeleted = false;
    this.status = 1;
    this.editLogs = [{
      editor: this.creator,
      datetime: Date.now()
    }];
  } else {
    this.meta.updateAt = Date.now();
    this.editLogs = this.editLogs.concat([{
      editor: this.lastEditor,
      datetime: Date.now()
    }]);
  }
  next();
});

PaperSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .populate('subject', {
        'name': 1
      })
      .sort({
        'meta.createAt': -1
      })
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
      .populate('subject', {
        'name': 1
      })
      .populate('composes.ctype', {
        'name': 1
      })
      .exec(cb);
  }
};

module.exports = mongoose.model('Paper', PaperSchema);