const authService = require('../services/authService');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { TenTaiKhoan, MatKhau } = req.body;
    if (!TenTaiKhoan || !MatKhau)
      return error(res, 'Vui lòng nhập tài khoản và mật khẩu', 400);
    const result = await authService.login(TenTaiKhoan, MatKhau);
    success(res, result, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.MaNV1);
    success(res, profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
