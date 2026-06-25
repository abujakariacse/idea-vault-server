const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: { type: String, default: '' },
  password: { type: String },
  googleId: { type: String },
  likedIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }]
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
