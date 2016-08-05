var mongoose = require('mongoose');

var SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

SubjectSchema.statics = {
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
  }
};

module.exports = mongoose.model('Subject', SubjectSchema);
