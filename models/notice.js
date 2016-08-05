var mongoose = require('mongoose');

var NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

NoticeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

NoticeSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .sort('meta.createAt')
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
      .sort('meta.createAt')
      .exec(cb);
  }
};

module.exports = mongoose.model('Notice', NoticeSchema);
