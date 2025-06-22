const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/login');
};

const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/notes');
};

const ensureCounselor = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Unauthorized access');
  res.redirect('/notes');
};

const ensureStudent = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'student') {
    return next();
  }
  req.flash('error_msg', 'Unauthorized access');
  res.redirect('/notes');
};

module.exports = {
  ensureAuthenticated,
  ensureGuest,
  ensureCounselor,
  ensureStudent
};
