var mongoose = require('mongoose');

var TestTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
});

TestTypeSchema.statics = {
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

module.exports = mongoose.model('TestType', TestTypeSchema);
