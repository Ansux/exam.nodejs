var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  pwd: {
    type: String,
    required: true
  },
  sex: String,
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

AdminSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
    this.pwd = bcrypt.hashSync(this.pwd);
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

AdminSchema.methods = {
  validPwd: function(pwd, cb) {
    bcrypt.compare(pwd, this.pwd, function(err, res) {
      cb(res);
    });
  }
};

AdminSchema.statics = {
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

module.exports = mongoose.model('Admin', AdminSchema);
