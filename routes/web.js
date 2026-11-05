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

// Section index pages: Projects, Products, Prototypes & R&D
Object.keys(site.sections).forEach(function (type) {
  const sec = site.sections[type];
  router.get('/' + sec.path, function (req, res) {
    res.render('section', {
      layout: 'layout',
      bodyClass: 'section-page',
      title: sec.title + ' | SciFlair',
      site: site,
      sec: sec,
      items: site.byType(type)
    });
  });
});

// Sector pages: everything in one sector across Projects, Products and R&D
router.get('/sectors/:key', function (req, res, next) {
  const key = req.params.key;
  if (site.sectorTiles.indexOf(key) < 0) return next();
  const items = site.bySector(key);
  res.render('sector', {
    layout: 'layout',
    bodyClass: 'section-page',
    title: site.sectors[key].name + ' | SciFlair',
    site: site,
    key: key,
    s: site.sectors[key],
    groups: ['project', 'product', 'prototype'].map(function (t) {
      return { sec: site.sections[t], items: items.filter(function (p) { return p.type === t; }) };
    }).filter(function (g) { return g.items.length; })
  });
});

// Detail pages (only items with a full write-up get a page)
router.get('/:section(projects|products|research)/:slug', function (req, res, next) {
  const p = site.projects.filter(function (x) { return x.slug === req.params.slug && x.need; })[0];
  if (!p) return next();
  if (site.sectionFor(p).path !== req.params.section) return res.redirect(301, '/' + site.sectionFor(p).path + '/' + p.slug);
  const related = (p.related || []).map(function (s) {
    return site.projects.filter(function (x) { return x.slug === s; })[0];
  }).filter(Boolean);
  res.render('project', {
    layout: 'layout',
    bodyClass: 'project',
    title: p.title + (p.region ? ' – ' + p.region : '') + ' | SciFlair',
    site: site,
    p: p,
    related: related
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
  console.log('[contact] %s enquiry from %s <%s> (%s): %s', (b.role || 'unknown'), name, email, (b.organisation || '').trim(), message.slice(0, 500));
  return res.redirect('/?contact=not-connected#contact');
});

module.exports = router;
