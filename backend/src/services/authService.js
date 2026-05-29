const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { TaiKhoan, NhanVien, PhongBan, ChucVu } = require('../models');

const login = async (tenTaiKhoan, matKhau) => {
  const tk = await TaiKhoan.findOne({
    where: { TenTaiKhoan: tenTaiKhoan },
    include: [{ model: NhanVien, as: 'nhanVien',
      include: [
        { model: PhongBan, as: 'phongBan' },
        { model: ChucVu, as: 'chucVu' },
      ]
    }],
  });

  if (!tk) throw { status: 401, message: 'Tài khoản không tồn tại' };
  if (tk.MatKhau !== matKhau) throw { status: 401, message: 'Mật khẩu không đúng' };

  const payload = {
    TenTaiKhoan: tk.TenTaiKhoan,
    PhanQuyen: tk.PhanQuyen,
    MaNV1: tk.MaNV1,
    TenNV: tk.nhanVien?.TenNV,
    Avatar: tk.nhanVien?.Avatar,
  };

  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  return { token, user: payload };
};

const getProfile = async (maNV1) => {
  return NhanVien.findOne({
    where: { MaNV1: maNV1 },
    include: [
      { model: PhongBan, as: 'phongBan' },
      { model: ChucVu, as: 'chucVu' },
      { model: TaiKhoan, as: 'taiKhoan', attributes: ['TenTaiKhoan', 'PhanQuyen'] },
    ],
  });
};

module.exports = { login, getProfile };
