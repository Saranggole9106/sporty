const express = require('express');
const router = express.Router();
const Ground = require('../models/Ground');

// GET /api/grounds - Get all active grounds
router.get('/', async (req, res) => {
  try {
    const grounds = await Ground.find({ isActive: true }).select('-__v');
    
    res.json({
      success: true,
      count: grounds.length,
      grounds: grounds
    });
  } catch (error) {
    console.error('Get grounds error:', error);
    res.status(500).json({
      error: 'Unable to retrieve grounds',
      message: 'Failed to get grounds list'
    });
  }
});

// GET /api/grounds/:id - Get specific ground details
router.get('/:id', async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);
    
    if (!ground) {
      return res.status(404).json({
        error: 'Ground not found',
        message: 'Ground with specified ID does not exist'
      });
    }

    res.json({
      success: true,
      ground: ground
    });
  } catch (error) {
    console.error('Get ground error:', error);
    res.status(500).json({
      error: 'Unable to retrieve ground',
      message: 'Failed to get ground details'
    });
  }
});

// POST /api/grounds - Create new ground (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, location, slots, description, capacity } = req.body;

    if (!name || !location || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, location, and slots array are required'
      });
    }

    const newGround = new Ground({
      name,
      location,
      slots,
      description,
      capacity: capacity || 1
    });

    await newGround.save();

    res.status(201).json({
      success: true,
      message: 'Ground created successfully',
      ground: newGround
    });
  } catch (error) {
    console.error('Create ground error:', error);
    res.status(500).json({
      error: 'Unable to create ground',
      message: 'Failed to create new ground'
    });
  }
});

module.exports = router;
