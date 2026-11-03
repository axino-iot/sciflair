// Error handler: real 404 pages for missing URLs, 500 only for genuine server errors.
// (Previously every missing URL – including /robots.txt – returned a 500 JSON error,
// which made search engines and LinkedIn treat the whole site as unreadable.)
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status);
  if (req.accepts('html')) {
    return res.render(status === 404 ? 'error' : 'error1', {
      layout: 'layout',
      title: status === 404 ? 'Page not found | SciFlair' : 'Something went wrong | SciFlair',
      message: status === 404 ? 'Page not found' : 'Something went wrong',
      error: { status, stack: '' },
    });
  }
  return res.json({ success: false, error: status === 404 ? 'Not Found' : 'Server Error' });
};

module.exports = errorHandler;
