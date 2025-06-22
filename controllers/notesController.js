const Note = require('../models/Note');
const Student = require('../models/Student');

// Get all notes
exports.getNotes = async (req, res) => {
  try {
    let query = {};
    
    // Students can only see their own notes
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (!student) {
        req.flash('error', 'Student profile not found');
        return res.redirect('/');
      }
      query.student = student._id;
    }
    
    // Counselors can see all notes or filter by student
    if (req.user.role === 'counselor' && req.query.student) {
      query.student = req.query.student;
    }

    const notes = await Note.find(query)
      .populate('student', 'name studentId')
      .populate('counselor', 'name')
      .sort({ createdAt: -1 });

    const students = req.user.role === 'counselor' 
      ? await Student.find().sort({ name: 1 }) 
      : null;

    res.render('notes/index', { 
      title: 'Session Notes',
      notes, // Make sure this is passed
      students,
      selectedStudent: req.query.student || '',
      userRole: req.user.role,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching notes');
    res.redirect('/');
  }
};

// Search notes
exports.searchNotes = async (req, res) => {
  try {
    const { keyword } = req.query;
    let query = {
      content: { $regex: keyword, $options: 'i' }
    };

    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (!student) {
        req.flash('error_msg', 'Student profile not found');
        return res.redirect('/');
      }
      query.student = student._id;
    }

    const notes = await Note.find(query)
      .populate('student', 'name studentId')
      .populate('counselor', 'name')
      .sort({ createdAt: -1 });

    res.render('notes/search', {
      title: 'Search Results',
      notes,
      keyword,
      user: req.user,
      userRole: req.user.role
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error searching notes');
    res.redirect('/notes');
  }
};

// Add note form
exports.addNoteForm = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.render('notes/add', {
      title: 'Add Note',
      students,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading form');
    res.redirect('/notes');
  }
};

// Add note
exports.addNote = async (req, res) => {
  try {
    const { student, content } = req.body;

    await Note.create({
      student,
      counselor: req.user._id,
      content
    });

    req.flash('success_msg', 'Note added successfully');
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding note');
    res.redirect('/notes/add');
  }
};

// Edit note form
// Add this to your notesController.js
exports.editNoteForm = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('student', 'name studentId')
      .populate('counselor', 'name');
    
    if (!note) {
      req.flash('error', 'Note not found');
      return res.redirect('/notes');
    }

    // Allow admin or the counselor who created the note to edit
    if (req.user.role !== 'admin' && note.counselor._id.toString() !== req.user._id.toString()) {
      req.flash('error', 'Not authorized to edit this note');
      return res.redirect('/notes');
    }

    const students = await Student.find().sort({ name: 1 });
    
    res.render('notes/edit', {
      title: 'Edit Note',
      note,
      students,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading note');
    res.redirect('/notes');
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { student, content } = req.body;
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      req.flash('error', 'Note not found');
      return res.redirect('/notes');
    }

    // Authorization check
    if (req.user.role !== 'admin' && note.counselor._id.toString() !== req.user._id.toString()) {
      req.flash('error', 'Not authorized to update this note');
      return res.redirect('/notes');
    }

    note.student = student;
    note.content = content;
    note.updatedAt = Date.now();
    await note.save();

    req.flash('success', 'Note updated successfully');
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating note');
    res.redirect(`/notes/edit/${req.params.id}`);
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      req.flash('error_msg', 'Note not found');
      return res.redirect('/notes');
    }

    if (note.counselor.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'You are not authorized to delete this note');
      return res.redirect('/notes');
    }

    await note.deleteOne();

    req.flash('success_msg', 'Note deleted successfully');
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting note');
    res.redirect('/notes');
  }
};

// controllers/notesController.js
exports.getNotes = async (req, res) => {
  try {
    let query = {};
    const selectedStudent = req.query.student || ''; // Get selected student from query
    
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (!student) {
        req.flash('error', 'Student profile not found');
        return res.redirect('/');
      }
      query.student = student._id;
    } else if (req.user.role === 'counselor' && selectedStudent) {
      query.student = selectedStudent;
    }

    const notes = await Note.find(query)
      .populate('student', 'name studentId')
      .populate('counselor', 'name')
      .sort({ createdAt: -1 });

    const students = req.user.role === 'counselor' 
      ? await Student.find().sort({ name: 1 }) 
      : null;

    res.render('notes/index', { 
      title: 'Session Notes',
      notes,
      students,
      selectedStudent,
      userRole: req.user.role,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching notes');
    res.redirect('/');
  }
};
