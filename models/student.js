var mongoose = require('mongoose');

var StudentSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  pwd: {
    type: String,
    required: true
  },
  sno: {
    type: Number,
    unique: true
  },
  sname: {
    type: String,
    required: true
  },
  sex: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes'
  },
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

StudentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

StudentSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .sort('meta.createAt')
      .exec(cb);
  },
  findByClass: function(classId, cb) {
    return this
      .find({
        classId: classId
      })
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

module.exports = mongoose.model('Student', StudentSchema);
