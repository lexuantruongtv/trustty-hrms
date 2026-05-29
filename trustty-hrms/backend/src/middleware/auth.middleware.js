const jwt = require('jsonwebtoken');

function xacThucToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, nguoiDung) => {
    if (error) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    req.nguoiDung = nguoiDung;
    next();
  });
}

function yeuCauQuyen(...danhSachQuyen) {
  return (req, res, next) => {
    if (!danhSachQuyen.includes(req.nguoiDung.phanQuyen)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
}

module.exports = { xacThucToken, yeuCauQuyen };
