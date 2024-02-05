const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please tell us your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'PLease provide a valid email'],
    },
    photo: {
      type: String,
      default:'default.jpg'
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
      },
      message: 'passwords are not the same',
    },
    passwordsChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
      type:Boolean,
      default:true,
      select:false
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// encrypt the password
userSchema.pre('save', async function (next) {
  //only run this function if password is actually modified
  //what if only email was updated the we directly return the next()
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //this 12 indicates how cpu intensive the encrypting proces will be
  //higher the nunmber stronger the encryption
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};
userSchema.methods.changePasswordsAfter = function (jwttimestamp) {
  if (this.passwordsChangedAt) {
    // converts the date you passed into timepstamp form  i.e seconds as jwttimestamp is in seconds form

    const changedTimestamp = parseInt(
      this.passwordsChangedAt.getTime() / 1000,
      10
    );

    return jwttimestamp < changedTimestamp;
    //true if passworrd was changed after the token was issued
  }
  //false means password was not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save',function(next){
  if(!this.isModified('password') || this.isNew) return next();
  this.passwordsChangedAt=Date.now()-1000
  next()
})

userSchema.pre(/^find/,function(next){
    //executes for queries starting with find
    this.find({active:{$ne:false}});
    next();
})
const User = mongoose.model('User', userSchema);
module.exports = User;

//bcrypt salts i.e adds a unique string to the password ,then hashes it to be secure from attacks
//nobone can now understand it even if attacker see the db
