const Student = require('../models/Student');
const Note = require('../models/Note');
const User = require('../models/User');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/');
    }

    res.render('students/profile', {
      title: 'My Profile',
      student,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading profile');
    res.redirect('/');
  }
};

// View all notes for the student
exports.getNotes = async (req, res) => {
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
};

// Search student notes
exports.searchNotes = async (req, res) => {
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
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const student = await Student.findOneAndUpdate(
      { email: req.user.email },
      { name, phone },
      { new: true, runValidators: true }
    );

    // Also update the user name
    await User.findOneAndUpdate(
      { email: req.user.email },
      { name },
      { new: true, runValidators: true }
    );

    req.flash('success', 'Profile updated successfully');
    res.redirect('/students/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating profile');
    res.redirect('/students/profile');
  }
};
