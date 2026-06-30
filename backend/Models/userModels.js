import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password must be more than 8 characters"],
    validate: {
      validator: function (password) {
        // Check for uppercase, lowercase, number, and special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          password
        );
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
    select: false, // Prevents password from being returned in queries
  },
  
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    validate: {
      validator: function (phone) {
        return validator.isMobilePhone(phone, 'any');
      },
      message: "Please enter a valid phone number",
    },
  },
  
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  
  profileImage: {
    public_id: String,
    url: String,
  },
  
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // OTP for email verification
  otp: String,
  otpExpire: Date,
  refreshToken: String,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE;
  if (!jwtSecret || !jwtExpire) {
    throw new Error(
      "JWT_SECRET or JWT_EXPIRE environment variable is not set."
    );
  }
  return Jwt.sign({ id: this._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  try {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate reset password token.");
  }
};

userSchema.methods.getRefreshToken = function () {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpire = process.env.REFRESH_TOKEN_EXPIRE;
  if (!refreshTokenSecret || !refreshTokenExpire) {
    throw new Error(
      "REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRE environment variable is not set."
    );
  }
  return Jwt.sign({ id: this._id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpire,
  });
};

userSchema.methods.getEmailVerificationToken = function () {
  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate email verification token.");
  }
};

userSchema.methods.generateOTP = function () {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = crypto.createHash("sha256").update(otp).digest("hex");
    this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate OTP.");
  }
};

userSchema.methods.incrementLoginAttempts = function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= parseInt(process.env.MAX_LOGIN_ATTEMPTS) && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + parseInt(process.env.LOCKOUT_TIME_MS) };
  }

  return this.updateOne(updates);
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model("User", userSchema);

// Drop the old username index if it exists (migration cleanup)
User.init().then(() => {
  User.collection.getIndexes().then(indexes => {
    if (indexes.username_1) {
      User.collection.dropIndex('username_1').then(() => {
        console.log('✅ Dropped old username_1 index');
      }).catch(err => {
        console.log('ℹ️ username_1 index already removed or error:', err.message);
      });
    }
  }).catch(err => {
    console.log('ℹ️ Error checking indexes:', err.message);
  });
}).catch(err => {
  console.log('ℹ️ Model init error:', err.message);
});

export default User;
