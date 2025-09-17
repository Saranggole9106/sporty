const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  groundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ground',
    required: [true, 'Ground ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(date) {
        // Ensure booking date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      message: 'Booking date cannot be in the past'
    }
  },
  slot: {
    type: String,
    required: [true, 'Time slot is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent double booking (same student, same date)
bookingSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Index for faster queries
bookingSchema.index({ groundId: 1, date: 1, slot: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingReference: 1 });

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
