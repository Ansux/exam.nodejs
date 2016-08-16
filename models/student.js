var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

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
  sname: String,
  sex: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes'
  },
  isEnable: Boolean,
  isVerify: Boolean,
  meta: {
    createAt: Date,
    updateAt: Date
  }
});

StudentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = Date.now();
    this.isEnable = true;
    this.isVerify = false;
    this.pwd = bcrypt.hashSync(this.pwd);
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

StudentSchema.methods = {
  validPwd: function(pwd, cb) {
    bcrypt.compare(pwd, this.pwd, function(err, res) {
      cb(res);
    });
  }
};

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