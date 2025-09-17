const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  firebaseUID: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ email: 1 });
studentSchema.index({ rollNo: 1 });
studentSchema.index({ firebaseUID: 1 });

module.exports = mongoose.model('Student', studentSchema);
