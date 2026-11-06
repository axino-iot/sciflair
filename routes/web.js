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
      description: sec.intro + ' ' + sec.ask,
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
    description: site.sectors[key].intro,
    ogImage: site.sectors[key].hero,
    site: site,
    key: key,
    s: site.sectors[key],
    groups: ['product', 'project', 'prototype'].map(function (t) {
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
    title: p.title + ' | SciFlair',
    description: p.headline,
    ogImage: p.hero || p.photo,
    site: site,
    p: p,
    related: related
  });
});

// Sitemap, generated from the data so new pages are listed automatically
router.get('/sitemap.xml', function (req, res) {
  const base = 'https://www.sciflair.com';
  const urls = ['/'].concat(
    Object.keys(site.sections).map(function (k) { return '/' + site.sections[k].path; }),
    site.sectorTiles.map(function (k) { return '/sectors/' + k; }),
    site.projects.filter(function (p) { return p.need; }).map(function (p) { return '/' + site.sectionFor(p).path + '/' + p.slug; })
  );
  res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(function (u) { return '  <url><loc>' + base + u + '</loc></url>'; }).join('\n') + '\n</urlset>\n');
});

// Contact form: sent to CONTACT_TO through Microsoft 365 (lib/mailer.js).
// Until the M365 settings are in config/config.env, the message is logged and
// the visitor is asked to email us as well.
const mailer = require('../lib/mailer');
const recent = {}; // simple per-IP limit: 5 messages an hour
const ROLES = { client: 'Client with a project', investor: 'Investor or funder', recruiter: 'Recruiter or employer', partner: 'Partner or contractor', research: 'University or researcher', other: 'Something else' };
router.post('/contact', function (req, res) {
  const b = req.body || {};
  if (b.website) return res.redirect('/?contact=sent#contact'); // honeypot: bots fill this
  const name = (b.name || '').trim().slice(0, 120);
  const email = (b.email || '').trim().slice(0, 200);
  const organisation = (b.organisation || '').trim().slice(0, 160);
  const message = (b.message || '').trim().slice(0, 5000);
  const role = ROLES[b.role] || 'Not given';
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) {
    return res.redirect('/?contact=invalid#contact');
  }
  const ip = req.ip || 'x'; const now = Date.now();
  recent[ip] = (recent[ip] || []).filter(function (t) { return now - t < 3600000; });
  if (recent[ip].length >= 5) return res.redirect('/?contact=sent#contact');
  recent[ip].push(now);
  console.log('[contact] %s enquiry from %s <%s> (%s)', role, name, email, organisation);
  if (!mailer.configured()) return res.redirect('/?contact=not-connected#contact');
  mailer.sendEnquiry({ name: name, email: email, organisation: organisation, role: role, message: message })
    .then(function () { res.redirect('/?contact=sent#contact'); })
    .catch(function (err) {
      console.error('[contact] send failed: %s', err.message);
      console.log('[contact] message from %s: %s', email, message.slice(0, 1000));
      res.redirect('/?contact=not-connected#contact');
    });
});

module.exports = router;
