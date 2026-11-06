// Sends contact-form messages through Microsoft 365 (Microsoft Graph sendMail).
// Uses the app-only client-credentials flow. Works on Node 12 (no fetch, no ?. / ??).
//
// Settings (config/config.env on the server, never committed):
//   M365_TENANT_ID      Directory (tenant) ID of sciflair.com
//   M365_CLIENT_ID      Application (client) ID of the "SciFlair website" app registration
//   M365_CLIENT_SECRET  Client secret value
//   M365_SENDER         Mailbox the message is sent from, e.g. website@sciflair.com
//   CONTACT_TO          Where enquiries go, e.g. info@sciflair.com (an alias is fine)

const https = require('https');
const querystring = require('querystring');

let cached = { token: null, expires: 0 };

function configured() {
  return !!(process.env.M365_TENANT_ID && process.env.M365_CLIENT_ID &&
            process.env.M365_CLIENT_SECRET && process.env.M365_SENDER);
}

function request(options, body) {
  return new Promise(function (resolve, reject) {
    const req = https.request(options, function (res) {
      let data = '';
      res.on('data', function (c) { data += c; });
      res.on('end', function () { resolve({ status: res.statusCode, body: data }); });
    });
    req.on('error', reject);
    req.setTimeout(15000, function () { req.destroy(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function getToken() {
  if (cached.token && Date.now() < cached.expires) return Promise.resolve(cached.token);
  const body = querystring.stringify({
    client_id: process.env.M365_CLIENT_ID,
    client_secret: process.env.M365_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });
  return request({
    method: 'POST',
    hostname: 'login.microsoftonline.com',
    path: '/' + encodeURIComponent(process.env.M365_TENANT_ID) + '/oauth2/v2.0/token',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body).then(function (r) {
    const j = JSON.parse(r.body || '{}');
    if (r.status !== 200 || !j.access_token) throw new Error('token ' + r.status + ' ' + (j.error || ''));
    cached = { token: j.access_token, expires: Date.now() + (j.expires_in - 300) * 1000 };
    return cached.token;
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// f = { name, email, organisation, role, message }
function sendEnquiry(f) {
  if (!configured()) return Promise.reject(new Error('not-configured'));
  const to = process.env.CONTACT_TO || 'info@sciflair.com';
  const rows = [['Name', f.name], ['Email', f.email], ['Organisation', f.organisation || '–'], ['Getting in touch as', f.role || '–']]
    .map(function (r) { return '<tr><td style="padding:4px 12px 4px 0;color:#58595B"><b>' + r[0] + '</b></td><td>' + esc(r[1]) + '</td></tr>'; }).join('');
  const html = '<p>New enquiry from the sciflair.com contact form.</p><table>' + rows + '</table>' +
    '<p style="white-space:pre-wrap;border-left:3px solid #F65438;padding-left:12px">' + esc(f.message) + '</p>' +
    '<p style="color:#888;font-size:12px">Reply to this email to answer ' + esc(f.name) + ' directly.</p>';
  const payload = JSON.stringify({
    message: {
      subject: 'Website enquiry: ' + f.name + (f.organisation ? ' (' + f.organisation + ')' : '') + ' – ' + (f.role || 'general'),
      body: { contentType: 'HTML', content: html },
      toRecipients: [{ emailAddress: { address: to } }],
      replyTo: [{ emailAddress: { address: f.email, name: f.name } }]
    },
    saveToSentItems: true
  });
  return getToken().then(function (token) {
    return request({
      method: 'POST',
      hostname: 'graph.microsoft.com',
      path: '/v1.0/users/' + encodeURIComponent(process.env.M365_SENDER) + '/sendMail',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload);
  }).then(function (r) {
    if (r.status !== 202) throw new Error('sendMail ' + r.status + ' ' + r.body.slice(0, 300));
  });
}

module.exports = { configured: configured, sendEnquiry: sendEnquiry };
