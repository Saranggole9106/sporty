const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// POST /api/students/register - Register a new student
router.post('/register', async (req, res) => {
  try {
    const { name, email, rollNo, department, firebaseUID } = req.body;

    if (!name || !email || !rollNo || !department || !firebaseUID) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, email, rollNo, department, and firebaseUID are required'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: email },
        { rollNo: rollNo },
        { firebaseUID: firebaseUID }
      ]
    });

    if (existingStudent) {
      return res.status(409).json({
        error: 'Student already exists',
        message: 'Student with this email, roll number, or Firebase UID already registered'
      });
    }

    const newStudent = new Student({
      name,
      email,
      rollNo,
      department,
      firebaseUID
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        rollNo: newStudent.rollNo,
        department: newStudent.department
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to register student'
    });
  }
});

// GET /api/students/profile/:firebaseUID - Get student profile
router.get('/profile/:firebaseUID', async (req, res) => {
  try {
    const student = await Student.findOne({ firebaseUID: req.params.firebaseUID });
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: 'Student profile does not exist'
      });
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        department: student.department,
        createdAt: student.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Unable to retrieve profile',
      message: 'Failed to get student profile'
    });
  }
});

module.exports = router;
