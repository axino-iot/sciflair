const express = require('express');
const router = express.Router();
const site = require('../data');

// Homepage
router.get('/', function (req, res) {
  res.render('home', {
    layout: 'layout',
    bodyClass: 'home',
    site: site,
    contactStatus: req.query.contact || null
  });
});

// Contact form.
// Delivery (SMTP or a form service) is still to be decided, so for now the
// message is validated and logged, and the visitor is asked to email us.
// Replace the "not-connected" branch once delivery is chosen.
router.post('/contact', function (req, res) {
  const b = req.body || {};
  if (b.website) return res.redirect('/?contact=sent#contact'); // honeypot: bots fill this
  const name = (b.name || '').trim();
  const email = (b.email || '').trim();
  const message = (b.message || '').trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) {
    return res.redirect('/?contact=invalid#contact');
  }
  console.log('[contact] enquiry from %s <%s> (%s): %s', name, email, (b.organisation || '').trim(), message.slice(0, 500));
  return res.redirect('/?contact=not-connected#contact');
});

module.exports = router;
