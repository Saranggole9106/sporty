const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ground name is required'],
    trim: true,
    maxlength: [100, 'Ground name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  slots: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Capacity must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
groundSchema.index({ name: 1 });
groundSchema.index({ isActive: 1 });

module.exports = mongoose.model('Ground', groundSchema);
