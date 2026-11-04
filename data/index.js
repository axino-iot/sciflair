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
  research:  { name: 'Research',         tag: 'slate',  blurb: '' },
  health:    { name: 'Digital Health',   tag: 'blue',   blurb: '' }
};

// Sector tiles on the homepage, in display order
const sectorTiles = ['energy', 'video', 'fleet', 'city', 'agri'];

const proof = [
  { value: '£10M+', label: 'programme led by our founder, concept to retirement' },
  { value: '3,000', label: 'sensors in one energy system' },
  { value: '5,000', label: 'people on an automated water supply' },
  { value: '75%',   label: 'faster prototype to deployment' }
];

// Generic system life cycle stages (INCOSE SE Handbook 4e / ISO/IEC/IEEE 15288).
// British spelling of "Utilisation" on the site.
const steps = [
  { title: 'Concept', text: 'Business and mission analysis, stakeholder needs and requirements, feasibility.' },
  { title: 'Development', text: 'System requirements, architecture and design definition, prototypes and verification.' },
  { title: 'Production', text: 'Manufacture, integration and factory acceptance testing.' },
  { title: 'Utilisation', text: 'Transition to site, site acceptance and validation in operational use.' },
  { title: 'Support', text: 'Maintenance, upgrades and field support for the life of the system.' },
  { title: 'Retirement', text: 'Planned disposal and handover to a successor system.' }
];

// Who the site is for: each route ends in a clear next step
const audiences = [
  { title: 'Commission a System', who: 'Clients',
    text: 'From a feasibility study to a full rollout and in-service support, with one team accountable for hardware, firmware, cloud and apps.',
    cta: 'Discuss your project', href: '#contact' },
  { title: 'Back a New System', who: 'Investors & Funders',
    text: 'Reusable platforms take new products from concept to field trials quickly, with a track record of grant, KTP and joint PhD funding.',
    cta: 'Talk about funding', href: '#contact' },
  { title: 'Partner or Hire', who: 'Recruiters & Partners',
    text: 'Programme and engineering leadership across the full system life cycle, from proposal and requirements to acceptance and support.',
    cta: 'Meet the founder', href: '#research' }
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

module.exports = { sectors, sectorTiles, proof, steps, audiences, projects, featured };
