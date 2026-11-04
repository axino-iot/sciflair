// Site content. Each project is one JSON file in data/projects/,
// with its photos in public/images/projects/<slug>/.
// Kept Node 12 compatible (no optional chaining or ?? operators).
const fs = require('fs');
const path = require('path');

const sectors = {
  energy:    { name: 'Energy & Water',   tag: 'green',  blurb: 'Energy management, smart metering and pump control for industry and utilities.' },
  video:     { name: 'Video & Security', tag: 'blue',   blurb: 'IP video management, CCTV control rooms and remote camera sites.' },
  fleet:     { name: 'Fleet & Tracking', tag: 'yellow', blurb: 'GPS tracking, fuel-theft prevention and in-vehicle monitoring.' },
  city:      { name: 'Smart City',       tag: 'yellow', blurb: 'Street lighting, air quality and parking sensors for councils.' },
  agri:      { name: 'AgriTech & AI',    tag: 'green',  blurb: 'Hydroponics, aquaponics and machine vision for food production.' },
  platforms: { name: 'Platforms',        tag: 'slate',  blurb: '' },
  research:  { name: 'Research',         tag: 'slate',  blurb: '' }
};

// Sector tiles on the homepage, in display order
const sectorTiles = ['energy', 'video', 'fleet', 'city', 'agri'];

const proof = [
  { value: '£10M+', label: 'programmes delivered' },
  { value: '3,000', label: 'sensors in one energy system' },
  { value: '5,000', label: 'homes on smart water control' },
  { value: '25+',   label: 'years of engineering' }
];

const steps = [
  { title: 'Requirements', text: 'We pin down what the system must do, where it runs and how success is measured.' },
  { title: 'Design & prototype', text: 'Hardware, firmware, cloud and app designed together, then proven on a working prototype.' },
  { title: 'Build & deploy', text: 'Manufacture, installation and commissioning, from a pilot site to a full rollout.' },
  { title: 'Support', text: 'Monitoring, updates and field support for the life of the system.' }
];

function loadProjects() {
  const dir = path.join(__dirname, 'projects');
  return fs.readdirSync(dir)
    .filter(function (f) { return f.slice(-5) === '.json'; })
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); })
    .sort(function (a, b) { return a.order - b.order; });
}

// Read once at start-up; restart pm2 after adding a project.
const projects = loadProjects();

const featured = projects
  .filter(function (p) { return p.featured > 0; })
  .sort(function (a, b) { return a.featured - b.featured; });

module.exports = { sectors, sectorTiles, proof, steps, projects, featured };
