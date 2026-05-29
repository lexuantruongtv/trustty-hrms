/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ',
  });
};

module.exports = errorHandler;
