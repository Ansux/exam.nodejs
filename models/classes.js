var mongoose = require('mongoose');

var ClassesSchema = new mongoose.Schema({
  no: {
    unique: true,
    type: Number
  },
  name: String,
  stus: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

ClassesSchema.pre('save', function(next) {
  if (this.isNew) {
    this.stus = [];
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

ClassesSchema.statics = {
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
  }
};

module.exports = mongoose.model('Classes', ClassesSchema);
