const express = require('express');
const router = express.Router();
const site = require('../data');

// Search titles and descriptions
const SEC_TITLES = { product: 'IoT Products and Platforms', project: 'Connected Systems Projects and Case Studies', prototype: 'IoT and AI Prototypes, Research and Development' };
function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; s = s.slice(0, n - 1); return s.slice(0, s.lastIndexOf(' ')).replace(/[,;:–-]$/, '') + '…'; }
function crumbs(list) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(function (c, i) {
    return { '@type': 'ListItem', position: i + 1, name: c[0], item: 'https://www.sciflair.com' + c[1] }; }) };
}

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
      title: SEC_TITLES[type] + ' | SciFlair',
      description: clip(sec.intro + ' ' + sec.ask, 158),
      jsonld: crumbs([['Home', '/'], [sec.title, '/' + sec.path]]),
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
    title: site.sectors[key].name + ' IoT Systems | SciFlair',
    description: clip(site.sectors[key].intro, 158),
    jsonld: crumbs([['Home', '/'], [site.sectors[key].name, '/sectors/' + key]]),
    ogImage: '/images/og-sciflair.jpg',
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
    title: (p.seoTitle || p.title) + ' | SciFlair',
    description: clip(p.headline, 158),
    jsonld: crumbs([['Home', '/'], [site.sectionFor(p).title, '/' + site.sectionFor(p).path], [p.title, '/' + site.sectionFor(p).path + '/' + p.slug]]),
    ogImage: '/images/og/' + p.slug + '.jpg',
    site: site,
    p: p,
    related: related
  });
});

// Sitemap, generated from the data so new pages are listed automatically
router.get('/privacy', function (req, res) {
  res.render('privacy', { title: 'Privacy Notice | SciFlair Ltd', description: 'How SciFlair Ltd uses the information you give us through sciflair.com.' });
});

router.get('/sitemap.xml', function (req, res) {
  const base = 'https://www.sciflair.com';
  const urls = ['/'].concat(
    Object.keys(site.sections).map(function (k) { return '/' + site.sections[k].path; }),
    site.sectorTiles.map(function (k) { return '/sectors/' + k; }),
    site.projects.filter(function (p) { return p.need; }).map(function (p) { return '/' + site.sectionFor(p).path + '/' + p.slug; }),
    ['/privacy']
  );
  const imgs = {};
  site.projects.forEach(function (p) {
    if (!p.need) return;
    const u = '/' + site.sectionFor(p).path + '/' + p.slug;
    imgs[u] = [p.hero || p.photo].concat((p.gallery || []).map(function (g) { return g.full || g.src; }))
      .filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  });
  res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    urls.map(function (u) {
      return '  <url><loc>' + base + u + '</loc>' + (imgs[u] || []).map(function (i) { return '<image:image><image:loc>' + base + i + '</image:loc></image:image>'; }).join('') + '</url>';
    }).join('\n') + '\n</urlset>\n');
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
