var mongoose = require('mongoose');

TeacherSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  pwd: {
    type: String,
    required: true
  },
  name: String,
  sex: String,
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

TeacherSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

TeacherSchema.statics = {
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
      .exec(cb);
  }
};

module.exports = mongoose.model('Teacher', TeacherSchema);
