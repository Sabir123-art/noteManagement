require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts');

// Route files
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Passport config
require('./config/passport')(passport);

// --- MIDDLEWARE SETUP ---

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride('_method'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine (EJS with layouts)
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// Flash messages
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// --- ROUTES ---

app.use('/', authRoutes);
app.use('/notes', notesRoutes); // Already required above
app.use('/students', studentRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    user: req.user || null
  });
});

// --- ERROR HANDLING ---

// 500 - Server error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    user: req.user || null
  });
});

// 404 - Not found
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user || null
  });
});

// --- START SERVER ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
