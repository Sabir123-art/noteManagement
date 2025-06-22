// controllers/authController.js
const User = require('../models/User');
const Student = require('../models/Student');
const passport = require('passport');

// Show login form
exports.showLoginForm = (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    layout: 'layout' 
  });
};

// Show register form
exports.showRegisterForm = (req, res) => {
  res.render('auth/register', { 
    title: 'Register',
    layout: 'layout' 
  });
};

// Handle login
exports.login = passport.authenticate('local', {
  successRedirect: '/notes',
  failureRedirect: '/login',
  failureFlash: true
});

// Handle registration
exports.register = async (req, res) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  try {
    if (password !== passwordConfirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }

    const user = await User.create({ name, email, password, role });

    if (role === 'student') {
      await Student.create({
        name,
        email,
        studentId: email.split('@')[0]
      });
    }

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    req.flash('success', 'You are logged out');
    res.redirect('/login');
  });
};
