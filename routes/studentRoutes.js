const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureStudent } = require('../middleware/auth');
const Student = require('../models/Student');
const Note = require('../models/Note');

router.get('/profile', ensureAuthenticated, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/notes');
    }

    res.render('students/profile', {
      title: 'My Profile',
      student,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading profile');
    res.redirect('/notes');
  }
});

router.get('/notes', ensureAuthenticated, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/');
    }

    const notes = await Note.find({ student: student._id })
      .populate('counselor', 'name')
      .sort({ createdAt: -1 });

    res.render('students/notes', {
      title: 'My Session Notes',
      notes,
      student,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading notes');
    res.redirect('/');
  }
});

router.get('/notes/search', ensureAuthenticated, ensureStudent, async (req, res) => {
  try {
    const { keyword } = req.query;
    const student = await Student.findOne({ email: req.user.email });
    
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/');
    }

    const notes = await Note.find({
      student: student._id,
      content: { $regex: keyword, $options: 'i' }
    })
    .populate('counselor', 'name')
    .sort({ createdAt: -1 });

    res.render('students/notes', {
      title: 'Search Results',
      notes,
      student,
      keyword,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error searching notes');
    res.redirect('/students/notes');
  }
});

module.exports = router;