// Site content. Each project is one JSON file in data/projects/,
// with its photos in public/images/projects/<slug>/.
// Kept Node 12 compatible (no optional chaining or ?? operators).
const fs = require('fs');
const path = require('path');

const sectors = {
  energy: { name: 'Energy & Water', tag: 'green', icon: 'bolt',
    blurb: 'Energy management, smart metering and pump control for industry and utilities.',
    intro: 'Connected systems that cut energy use, keep water flowing and read meters remotely, from a 3,000-sensor industrial plant to well pumps 5 km apart.',
    photo: '/images/projects/water-control/wellhead-flow-meter-800.webp', hero: '/images/projects/electricity-saver/site-ac-sensor-1600.webp' },
  agri: { name: 'AgriTech & AI', tag: 'green', icon: 'leaf',
    blurb: 'Machine vision, IoT and AI for insect farming and aquaponic food production.',
    intro: 'Field units, datasets and AI models for sustainable food and feed production, developed with Bristol Robotics Lab and UWE.',
    photo: '/images/projects/insecto/insect-detection-800.webp', hero: '/images/projects/insecto/insect-detection-1600.webp' },
  video: { name: 'Video & Security', tag: 'blue', icon: 'camera',
    blurb: 'Command and control, CCTV networks, video management and live video from vehicles.',
    intro: 'Mobile command and control, a 100+ camera surveillance network, our own video management software, and live video over multiple mobile networks.',
    photo: '/images/projects/svms/tower-ptz-camera-800.webp', hero: '/images/projects/svms/tower-ptz-camera-1600.webp' },
  city: { name: 'Smart City', tag: 'yellow', icon: 'city',
    blurb: 'Street lighting, air quality and parking sensors for councils and campuses.',
    intro: 'Sensors and controllers that make public infrastructure visible and controllable, from street-light feeders to parking bays and air quality.',
    photo: '/images/projects/street-lighting/controller-fitted-800.webp', hero: '/images/projects/street-lighting/feeder-cabinet-1600.webp' },
  health: { name: 'Digital Health', tag: 'blue', icon: 'pulse',
    blurb: 'Secure clinical workflows on Microsoft 365 that put the right information in front of clinicians.',
    intro: 'Automated clinical workflows that keep patient data inside the organisation and save clinicians time at the bedside.',
    photo: '/images/projects/surgical-workflow/workflow-diagram-light-800.webp', hero: '/images/projects/surgical-workflow/workflow-diagram-1600.webp' },
  fleet: { name: 'Fleet & Tracking', tag: 'yellow', icon: 'truck',
    blurb: 'Vehicle tracking, driver behaviour and anti-theft on our own trackers.',
    intro: 'Our own trackers and cloud platform for fleets, private vehicles and specialist assets.',
    photo: '/images/projects/itrack/s100-tracker-800.webp', hero: '/images/projects/itrack/s100-tracker-1600.webp' },
  all: { name: 'All sectors', tag: 'slate', blurb: '' }
};

// Sector tiles on the homepage, in display order (Fahim's priorities)
const sectorTiles = ['energy', 'agri', 'video', 'city', 'health', 'fleet'];

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

// The three sections of our work, each for a different reader with a clear ask
const sections = {
  product: { path: 'products', title: 'Products', who: 'For investors',
    intro: 'Our own hardware and software platforms, built once and reused across deployments.',
    ask: 'Back a product to scale it, or deploy it in your organisation.',
    cta: 'Talk about investment' },
  project: { path: 'projects', title: 'Projects', who: 'For clients',
    intro: 'Systems we designed, delivered and supported for others, in operational use through their life cycle.',
    ask: 'Tell us about a system you need, from a feasibility study to a full rollout and support.',
    cta: 'Discuss your project' },
  prototype: { path: 'research', title: 'Prototypes & R&D', who: 'For partners and funders',
    intro: 'Working prototypes, field trials and joint research, ready for the next stage of development.',
    ask: 'Co-develop, fund or license a prototype, or partner with us on research.',
    cta: 'Discuss a partnership' }
};

// Who the site is for: each route opens one section
const audiences = [
  { title: 'Back a Product', who: 'Investors',
    text: 'Our own platforms, proven in the field and reused across deployments, ready to scale.',
    cta: 'See our products', href: '/products' },
  { title: 'Commission a System', who: 'Clients',
    text: 'Systems delivered and running for others, with one senior lead accountable for hardware, firmware, cloud and apps.',
    cta: 'See our projects', href: '/projects' },
  { title: 'Partner on R&D', who: 'Partners & Funders',
    text: 'Prototypes, field trials and joint PhD research ready for the next stage, with a track record of grant and university funding.',
    cta: 'See prototypes and R&D', href: '/research' }
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

function byType(t) { return projects.filter(function (p) { return p.type === t; }); }
function bySector(k) { return projects.filter(function (p) { return p.sector === k; }); }
function sectionFor(p) { return sections[p.type] || sections.project; }

module.exports = { sectors, sectorTiles, proof, steps, audiences, sections, projects, featured, byType, bySector, sectionFor };
