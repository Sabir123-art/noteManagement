const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notesController');
const {
  ensureAuthenticated,
  ensureCounselor
} = require('../middleware/auth');
router.get('/', ensureAuthenticated, notesController.getNotes);

router.get('/search', ensureAuthenticated, notesController.searchNotes);

router.get('/add', ensureCounselor, notesController.addNoteForm);
router.post('/add', ensureCounselor, notesController.addNote);


router.get('/edit/:id', ensureCounselor, notesController.editNoteForm);
router.post('/edit/:id', ensureCounselor, notesController.updateNote);

router.post('/delete/:id', ensureCounselor, notesController.deleteNote);
router.delete('/delete/:id', ensureCounselor, notesController.deleteNote);

router.get(
  '/edit/:id',
  ensureAuthenticated,
  (req, res, next) => {
    if (req.user.role === 'admin') return next();
    ensureCounselor(req, res, next);
  },
  notesController.editNoteForm
);

router.put(
  '/edit/:id',
  ensureAuthenticated,
  (req, res, next) => {
    if (req.user.role === 'admin') return next();
    ensureCounselor(req, res, next);
  },
  notesController.updateNote
);

module.exports = router;
