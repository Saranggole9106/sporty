const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const Student = require('../models/Student');

// POST /api/bookings/book - Create a new booking
router.post('/book', async (req, res) => {
  try {
    const { studentId, groundId, date, slot } = req.body;

    // Validate required fields
    if (!studentId || !groundId || !date || !slot) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'studentId, groundId, date, and slot are required'
      });
    }

    // Check if student exists
    const student = await Student.findOne({ firebaseUID: studentId });
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: 'Please register first before making a booking'
      });
    }

    // Check if ground exists
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({
        error: 'Ground not found',
        message: 'Selected ground does not exist'
      });
    }

    // Validate if the slot exists for this ground
    if (!ground.slots.includes(slot)) {
      return res.status(400).json({
        error: 'Invalid slot',
        message: 'Selected slot is not available for this ground'
      });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if student already has an ACTIVE booking on the same date
    const existingBooking = await Booking.findOne({
      studentId: studentId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(409).json({
        error: 'Double booking not allowed',
        message: 'You already have a booking on this date',
        existingBooking: {
          ground: existingBooking.groundId,
          slot: existingBooking.slot,
          reference: existingBooking.bookingReference
        }
      });
    }

    // Check if the specific slot is already booked
    const slotBooked = await Booking.findOne({
      groundId: groundId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      slot: slot,
      status: { $ne: 'cancelled' }
    });

    if (slotBooked) {
      return res.status(409).json({
        error: 'Slot unavailable',
        message: 'This slot is already booked'
      });
    }

    // Generate booking reference
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const bookingReference = `BK${timestamp}${random}`.toUpperCase();

    // Create new booking
    const newBooking = new Booking({
      studentId: studentId,
      groundId: groundId,
      date: new Date(date),
      slot: slot,
      status: 'confirmed',
      bookingReference: bookingReference
    });

    await newBooking.save();

    // Populate ground details for response
    await newBooking.populate('groundId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: newBooking._id,
        reference: newBooking.bookingReference,
        ground: newBooking.groundId.name,
        location: newBooking.groundId.location,
        date: newBooking.date,
        slot: newBooking.slot,
        status: newBooking.status
      }
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      error: 'Booking failed',
      message: 'Unable to process booking request'
    });
  }
});

// GET /api/bookings/availability - Get available slots for a ground and date
router.get('/availability', async (req, res) => {
  try {
    const { groundId, date } = req.query;

    if (!groundId || !date) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'groundId and date are required'
      });
    }

    // Check if ground exists
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({
        error: 'Ground not found',
        message: 'Selected ground does not exist'
      });
    }

    const queryDate = new Date(date);
    const queryStartOfDay = new Date(queryDate);
    queryStartOfDay.setHours(0, 0, 0, 0);
    const queryEndOfDay = new Date(queryDate);
    queryEndOfDay.setHours(23, 59, 59, 999);
    
    // Get all booked slots for the specified ground and date
    const bookedSlots = await Booking.find({
      groundId: groundId,
      date: {
        $gte: queryStartOfDay,
        $lt: queryEndOfDay
      },
      status: { $ne: 'cancelled' }
    }).select('slot');

    const bookedSlotTimes = bookedSlots.map(booking => booking.slot);
    const availableSlots = ground.slots.filter(slot => !bookedSlotTimes.includes(slot));

    res.json({
      success: true,
      ground: {
        id: ground._id,
        name: ground.name,
        location: ground.location
      },
      date: date,
      totalSlots: ground.slots.length,
      availableSlots: availableSlots,
      bookedSlots: bookedSlotTimes
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      error: 'Unable to check availability',
      message: 'Failed to retrieve slot availability'
    });
  }
});

// GET /api/bookings/student/:studentId - Get all bookings for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const bookings = await Booking.find({ studentId: studentId })
      .populate('groundId', 'name location')
      .sort({ date: -1 });

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking._id,
        reference: booking.bookingReference,
        ground: booking.groundId.name,
        location: booking.groundId.location,
        date: booking.date,
        slot: booking.slot,
        status: booking.status,
        createdAt: booking.createdAt
      }))
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Unable to retrieve bookings',
      message: 'Failed to get student bookings'
    });
  }
});

// DELETE /api/bookings/:bookingId - Cancel a booking
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { studentId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      studentId: studentId
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'Booking does not exist or does not belong to you'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      reference: booking.bookingReference
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Unable to cancel booking',
      message: 'Failed to cancel booking'
    });
  }
});

module.exports = router;
