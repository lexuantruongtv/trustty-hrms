import {
  Avatar, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { calculatePayroll, autoCalculatePayroll, deletePayroll, getPayroll } from '../api/payroll';
import { getEmployees } from '../api/employees';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import SearchableEmployeeSelect from '../components/common/SearchableEmployeeSelect';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatCurrency, getInitials } from '../utils/format';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtVND = (n) => fmt(n) + ' ₫';

const todayStr = () => {
  const d = new Date();
  return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
};

// Tính các khoản BH từ LuongCB (fallback khi DB chưa có cột)
// Thực lĩnh = LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN + BienDong
const calcBH = (bl) => {
  const luongCB = +(bl.LuongCB || 0);
  const phuCap = +(bl.PhuCap || 0);
  const bienDong = +(bl.TongBienDong ?? 0);
  const bhxh = +(bl.BHXH || 0) || luongCB * 0.08;
  const bhyt = +(bl.BHYT || 0) || luongCB * 0.015;
  const bhtn = +(bl.BHTN || 0) || luongCB * 0.01;
  const thue = +(bl.ThueTNCN || 0) || luongCB * 0.1;
  const thucLinh = luongCB + phuCap - thue - bhxh - bhyt - bhtn + bienDong;
  return { bhxh, bhyt, bhtn, thue, thucLinh };
};

// ─── PDF / Print ──────────────────────────────────────────────────────────────

/**
 * Mở cửa sổ in HTML — hỗ trợ đầy đủ Unicode/tiếng Việt, màu sắc, layout.
 * Trình duyệt cho phép "Save as PDF" từ hộp thoại in.
 */
const printHTML = (rows, thang, nam, bulk = false) => {
  const today = todayStr();

  const singleSlip = (bl) => {
    const luongCB = +(bl.LuongCB || 0);
    const phuCap = +(bl.PhuCap || 0);
    const bienDong = +(bl.TongBienDong ?? 0);
    const { bhxh, bhyt, bhtn, thue, thucLinh } = calcBH(bl);

    const incomeRows = [
      ['1', 'Lương cơ bản', fmt(luongCB)],
      ['2', 'Phụ cấp', fmt(phuCap)],
      ...(bienDong > 0 ? [['3', 'Biến động lương', `+${fmt(bienDong)}`]] : []),
    ];

    let stt = incomeRows.length + 1;
    const deductRows = [
      [String(stt++), 'Thuế TNCN (10%)', `−${fmt(thue)}`],
      [String(stt++), 'BHXH – Bảo hiểm xã hội (8%)', `−${fmt(bhxh)}`],
      [String(stt++), 'BHYT – Bảo hiểm y tế (1,5%)', `−${fmt(bhyt)}`],
      [String(stt++), 'BHTN – Bảo hiểm thất nghiệp (1%)', `−${fmt(bhtn)}`],
      ...(bienDong < 0 ? [[String(stt++), 'Biến động lương', `−${fmt(Math.abs(bienDong))}`]] : []),
    ];

    return `
      <div class="slip">
        <div class="header">
          <div class="company-sub">CÔNG TY CỔ PHẦN TRUSTTY &nbsp;|&nbsp; trustty.com &nbsp;|&nbsp; hr@trustty.com</div>
          <div class="title">PHIẾU LƯƠNG NHÂN VIÊN</div>
          <div class="period">Kỳ lương: Tháng ${bl.Thang} / Năm ${bl.Nam}</div>
        </div>

        <div class="date-line">${today}</div>

        <div class="section-title">I. Thông tin nhân viên</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">Họ và tên:</span><span class="info-val">${bl.nhanVien?.TenNV || '—'}</span></div>
          <div class="info-row"><span class="info-label">Mã nhân viên:</span><span class="info-val">${bl.MaNV1}</span></div>
          <div class="info-row"><span class="info-label">Chức vụ:</span><span class="info-val">${bl.nhanVien?.chucVu?.TenCV || '—'}</span></div>
          <div class="info-row"><span class="info-label">Phòng ban:</span><span class="info-val">${bl.nhanVien?.phongBan?.TenPB || '—'}</span></div>
          <div class="info-row"><span class="info-label">Số tài khoản:</span><span class="info-val">${bl.nhanVien?.SoTaiKhoanNN || '—'}</span></div>
        </div>

        <div class="section-title">II. Chi tiết lương</div>
        <table class="detail-table">
          <thead>
            <tr><th>#</th><th>Khoản mục</th><th>Số tiền (VNĐ)</th></tr>
          </thead>
          <tbody>
            <tr class="group-header income-header"><td colspan="3">THU NHẬP</td></tr>
            ${incomeRows.map(([s, l, v]) => `
              <tr>
                <td class="stt">${s}</td>
                <td>${l}</td>
                <td class="amount">${v}</td>
              </tr>`).join('')}
            <tr class="group-header deduct-header"><td colspan="3">KHẤU TRỪ</td></tr>
            ${deductRows.map(([s, l, v]) => `
              <tr>
                <td class="stt">${s}</td>
                <td>${l}</td>
                <td class="amount deduct">${v}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="total-box">
          <span>TỔNG THỰC LĨNH</span>
          <span class="total-val">${fmtVND(thucLinh)}</span>
        </div>

        <div class="sign-row">
          <div class="sign-col"><div class="sign-name">Người nhận lương</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Kế toán</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Giám đốc</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
        </div>

        <div class="footer">Phiếu lương được tạo từ hệ thống TrustTY HRMS</div>
      </div>`;
  };

  const bulkTable = () => {
    const headerCols = ['STT', 'Họ tên', 'Chức vụ', 'Phòng ban', 'Lương CB', 'Phụ cấp', 'Thuế TNCN (10%)', 'Bảo hiểm (10,5%)', 'Biến động', 'Thực lĩnh'];
    const bodyRows = rows.map((bl, idx) => {
      const luongCB = +(bl.LuongCB || 0);
      const bienDong = +(bl.TongBienDong ?? 0);
      const { bhxh, bhyt, bhtn, thue, thucLinh } = calcBH(bl);
      const tongBH = bhxh + bhyt + bhtn;
      return `<tr>
        <td style="text-align:center">${idx + 1}</td>
        <td><b>${bl.nhanVien?.TenNV || ''}</b></td>
        <td>${bl.nhanVien?.chucVu?.TenCV || '—'}</td>
        <td>${bl.nhanVien?.phongBan?.TenPB || '—'}</td>
        <td class="amount">${fmt(luongCB)}</td>
        <td class="amount">${fmt(bl.PhuCap)}</td>
        <td class="amount deduct">−${fmt(thue)}</td>
        <td class="amount deduct">−${fmt(tongBH)}</td>
        <td class="amount ${bienDong >= 0 ? 'income' : 'deduct'}">${bienDong >= 0 ? '+' : '−'}${fmt(Math.abs(bienDong))}</td>
        <td class="amount income"><b>${fmt(thucLinh)}</b></td>
      </tr>`;
    }).join('');

    return `
      <div class="slip bulk">
        <div class="header">
          <div class="company-sub">CÔNG TY CỔ PHẦN TRUSTTY</div>
          <div class="title">BẢNG TỔNG HỢP LƯƠNG THÁNG ${thang}/${nam}</div>
          <div class="period">${today}</div>
        </div>

        <table class="detail-table bulk-table">
          <thead>
            <tr>${headerCols.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>

        <div class="sign-row" style="margin-top:40px">
          <div class="sign-col"><div class="sign-name">Người lập phiếu</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Kế toán trưởng</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Giám đốc</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
        </div>
      </div>`;
  };

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; }
    .slip { max-width: 760px; margin: 0 auto; padding: 32px 36px; }
    .slip.bulk { max-width: 1050px; }

    /* Header */
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 10px; padding: 20px 24px; text-align: center; margin-bottom: 16px; }
    .company-sub { font-size: 11px; opacity: 0.85; margin-bottom: 6px; }
    .title { font-size: 20px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
    .period { font-size: 13px; opacity: 0.9; }

    /* Date */
    .date-line { text-align: right; font-size: 11px; color: #888; margin-bottom: 14px; }

    /* Section titles */
    .section-title { font-size: 12px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; border-bottom: 2px solid #e0e7ff; padding-bottom: 4px; }

    /* Info grid */
    .info-grid { background: #f8f9fc; border-radius: 8px; padding: 14px 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 4px; }
    .info-row { display: flex; gap: 8px; }
    .info-label { min-width: 110px; color: #666; font-size: 12px; }
    .info-val { font-weight: 600; font-size: 13px; }

    /* Detail table */
    .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
    .detail-table th { background: #6366f1; color: #fff; padding: 8px 10px; text-align: left; font-weight: 700; }
    .detail-table th:last-child { text-align: right; }
    .detail-table td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
    .detail-table tr:last-child td { border-bottom: none; }
    .detail-table tr:nth-child(even) td { background: #fafafa; }
    .group-header td { font-weight: 700; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 10px; }
    .income-header td { background: #dcfce7; color: #166534; }
    .deduct-header td { background: #fee2e2; color: #991b1b; }
    .stt { width: 32px; text-align: center; color: #aaa; font-size: 12px; }
    .amount { text-align: right; font-weight: 600; white-space: nowrap; }
    .deduct { color: #dc2626; }
    .income { color: #16a34a; }

    /* Total box */
    .total-box { background: linear-gradient(90deg, #ede9fe, #ddd6fe); border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .total-box span:first-child { font-size: 15px; font-weight: 700; color: #4338ca; }
    .total-val { font-size: 18px; font-weight: 800; color: #6366f1; }

    /* Signature */
    .sign-row { display: flex; justify-content: space-around; margin-top: 8px; }
    .sign-col { text-align: center; min-width: 130px; }
    .sign-name { font-weight: 700; font-size: 13px; }
    .sign-hint { font-size: 11px; color: #888; margin-top: 2px; }
    .sign-line { border-top: 1px solid #bbb; margin-top: 52px; width: 120px; margin-left: auto; margin-right: auto; }

    /* Footer */
    .footer { text-align: center; font-size: 10px; color: #bbb; margin-top: 24px; }

    /* Bulk table */
    .bulk-table th, .bulk-table td { font-size: 12px; padding: 6px 8px; }
    .bulk-table .amount { white-space: nowrap; }

    /* Page break between slips */
    .page-break { page-break-after: always; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .slip { padding: 20px 24px; }
      @page { margin: 12mm; ${bulk ? 'size: A4 landscape;' : 'size: A4 portrait;'} }
    }
  `;

  const body = bulk
    ? bulkTable()
    : rows.map((bl, i) =>
        singleSlip(bl) + (i < rows.length - 1 ? '<div class="page-break"></div>' : '')
      ).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html><html lang="vi"><head>
    <meta charset="UTF-8">
    <title>Phiếu lương – Tháng ${thang}/${nam}</title>
    <style>${css}</style>
  </head><body>${body}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
};

// ─── PayslipPreview (HTML preview bên trong Dialog) ──────────────────────────

const PayslipPreview = ({ rows, thang, nam, bulk }) => {
  if (!rows || rows.length === 0) return null;

  if (bulk) {
    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">CÔNG TY CỔ PHẦN TRUSTTY</Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
            BẢNG TỔNG HỢP LƯƠNG THÁNG {thang}/{nam}
          </Typography>
          <Typography variant="caption" color="text.secondary">{todayStr()}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {['STT', 'Họ tên', 'Chức vụ', 'Phòng ban', 'Lương CB', 'Phụ cấp', 'Thuế TNCN (10%)', 'Bảo hiểm (10,5%)', 'Biến động', 'Thực lĩnh'].map((h) => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((bl, idx) => {
                const luongCB = +(bl.LuongCB || 0);
                const bienDong = +(bl.TongBienDong ?? 0);
                const { bhxh, bhyt, bhtn, thue, thucLinh } = calcBH(bl);
                const tongBH = bhxh + bhyt + bhtn;
                return (
                  <TableRow key={bl.MaBL} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{bl.nhanVien?.TenNV}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{bl.nhanVien?.chucVu?.TenCV || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{bl.nhanVien?.phongBan?.TenPB || '—'}</TableCell>
                    <TableCell align="right">{formatCurrency(luongCB)}</TableCell>
                    <TableCell align="right">{formatCurrency(bl.PhuCap)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>−{formatCurrency(thue)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>−{formatCurrency(tongBH)}</TableCell>
                    <TableCell align="right" sx={{ color: bienDong >= 0 ? 'success.main' : 'error.main' }}>
                      {bienDong >= 0 ? '+' : '−'}{formatCurrency(Math.abs(bienDong))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main', whiteSpace: 'nowrap' }}>
                      {formatCurrency(thucLinh)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="space-around" sx={{ mt: 4, mb: 1 }}>
          {['Người lập phiếu', 'Kế toán trưởng', 'Giám đốc'].map((role) => (
            <Box key={role} sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="body2" fontWeight={700}>{role}</Typography>
              <Typography variant="caption" color="text.secondary">(Ký, ghi rõ họ tên)</Typography>
              <Box sx={{ borderBottom: '1px solid #aaa', mt: 5, width: 120, mx: 'auto' }} />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {rows.map((bl, idx) => {
        const luongCB = +(bl.LuongCB || 0);
        const bienDong = +(bl.TongBienDong ?? 0);
        const { bhxh, bhyt, bhtn, thue, thucLinh } = calcBH(bl);

        const incomeRows = [
          { stt: '1', label: 'Lương cơ bản', val: luongCB, color: 'text.primary', sign: '' },
          { stt: '2', label: 'Phụ cấp', val: +(bl.PhuCap || 0), color: 'text.primary', sign: '' },
          ...(bienDong > 0 ? [{ stt: '3', label: 'Biến động lương', val: bienDong, color: 'success.main', sign: '+' }] : []),
        ];
        let stt = incomeRows.length + 1;
        const deductRows = [
          { label: 'Thuế TNCN (10%)', val: thue },
          { label: 'BHXH – Bảo hiểm xã hội (8%)', val: bhxh },
          { label: 'BHYT – Bảo hiểm y tế (1,5%)', val: bhyt },
          { label: 'BHTN – Bảo hiểm thất nghiệp (1%)', val: bhtn },
          ...(bienDong < 0 ? [{ label: 'Biến động lương', val: Math.abs(bienDong) }] : []),
        ];

        return (
          <Box key={bl.MaBL} sx={{
            mb: idx < rows.length - 1 ? 5 : 0,
            pb: idx < rows.length - 1 ? 5 : 0,
            borderBottom: idx < rows.length - 1 ? '2px dashed #e0e0e0' : 'none',
          }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 2, p: 2.5, mb: 2, color: '#fff', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
                CÔNG TY CỔ PHẦN TRUSTTY &nbsp;|&nbsp; trustty.com &nbsp;|&nbsp; hr@trustty.com
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5, letterSpacing: 1 }}>PHIẾU LƯƠNG NHÂN VIÊN</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.25 }}>Kỳ lương: Tháng {bl.Thang} / Năm {bl.Nam}</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mb: 1.5 }}>
              {todayStr()}
            </Typography>

            {/* I. Thông tin NV */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              I. Thông tin nhân viên
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 2, mb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {[
                ['Họ và tên', bl.nhanVien?.TenNV],
                ['Mã nhân viên', bl.MaNV1],
                ['Chức vụ', bl.nhanVien?.chucVu?.TenCV || '—'],
                ['Phòng ban', bl.nhanVien?.phongBan?.TenPB || '—'],
                ['Số tài khoản', bl.nhanVien?.SoTaiKhoanNN || '—'],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100, flexShrink: 0 }}>{label}:</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}</Typography>
                </Box>
              ))}
            </Box>

            {/* II. Chi tiết lương */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              II. Chi tiết lương
            </Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', mb: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', px: 2, py: 1, bgcolor: 'primary.main' }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>#</Typography>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>Khoản mục</Typography>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>Số tiền</Typography>
              </Box>

              {/* Thu nhập */}
              <Box sx={{ px: 2, py: 0.75, bgcolor: '#dcfce7', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Thu nhập</Typography>
              </Box>
              {incomeRows.map((row, i) => (
                <Box key={row.stt} sx={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', px: 2, py: 1.1, bgcolor: i % 2 === 0 ? 'transparent' : 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>{row.stt}.</Typography>
                  <Typography variant="body2" fontWeight={500}>{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700} color={row.color} sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {row.sign}{formatCurrency(row.val)}
                  </Typography>
                </Box>
              ))}

              {/* Khấu trừ */}
              <Box sx={{ px: 2, py: 0.75, bgcolor: '#fee2e2', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Khấu trừ</Typography>
              </Box>
              {deductRows.map((row, i) => (
                <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', px: 2, py: 1.1, bgcolor: i % 2 === 0 ? 'transparent' : 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>{stt++}.</Typography>
                  <Typography variant="body2" fontWeight={500}>{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    −{formatCurrency(row.val)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Tổng thực lĩnh */}
            <Box sx={{ background: 'linear-gradient(90deg,#ede9fe,#ddd6fe)', borderRadius: 2, px: 2.5, py: 1.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.dark">TỔNG THỰC LĨNH</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">{formatCurrency(thucLinh)}</Typography>
            </Box>

            {/* Ký tên */}
            <Stack direction="row" justifyContent="space-around" sx={{ mt: 1 }}>
              {['Người nhận lương', 'Kế toán', 'Giám đốc'].map((role) => (
                <Box key={role} sx={{ textAlign: 'center', minWidth: 110 }}>
                  <Typography variant="body2" fontWeight={700}>{role}</Typography>
                  <Typography variant="caption" color="text.secondary">(Ký, ghi rõ họ tên)</Typography>
                  <Box sx={{ borderBottom: '1px solid #bbb', mt: 5, width: 110, mx: 'auto' }} />
                </Box>
              ))}
            </Stack>

            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              Phiếu lương được tạo từ hệ thống TrustTY HRMS
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── PayrollForm ─────────────────────────────────────────────────────────────

const PayrollForm = ({ open, onClose, onSave, employees }) => {
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => { if (open) reset({}); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tính lương nhân viên</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Controller name="MaNV1" control={control} rules={{ required: true }}
              render={({ field }) => (
                <SearchableEmployeeSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  employees={employees}
                />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller name="Thang" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Tháng" type="number" fullWidth slotProps={{ input: { inputProps: { min: 1, max: 12 } } }} />
                )}
              />
              <Controller name="Nam" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Năm" type="number" fullWidth defaultValue={new Date().getFullYear()} />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller name="LuongCB" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Lương cơ bản (VNĐ)" type="number" fullWidth />}
              />
              <Controller name="PhuCap" control={control}
                render={({ field }) => <TextField {...field} label="Phụ cấp (VNĐ)" type="number" fullWidth defaultValue={0} />}
              />
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            * Khấu trừ tự động: Thuế TNCN 10% + Bảo hiểm 10,5% (BHXH 8% + BHYT 1,5% + BHTN 1%)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Tính lương</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ─── ExportDialog ─────────────────────────────────────────────────────────────

const ExportDialog = ({ open, onClose, employees, filterThang, filterNam }) => {
  const toast = useToast();
  const currentYear = new Date().getFullYear();
  const [mode, setMode] = useState('single');
  const [maNV, setMaNV] = useState('');
  const [thang, setThang] = useState('');
  const [nam, setNam] = useState(currentYear);
  const [step, setStep] = useState('form');
  const [previewRows, setPreviewRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('single'); setMaNV(''); setStep('form'); setPreviewRows([]);
      setThang(filterThang || new Date().getMonth() + 1);
      setNam(filterNam || currentYear);
    }
  }, [open, filterThang, filterNam]);

  const handlePreview = async () => {
    if (!thang || !nam) { toast.error('Vui lòng chọn tháng và năm'); return; }
    if (mode === 'single' && !maNV) { toast.error('Vui lòng chọn nhân viên'); return; }
    setLoading(true);
    try {
      const params = { page: 1, limit: 1000, Thang: thang, Nam: nam };
      if (mode === 'single') params.MaNV1 = maNV;
      const res = await getPayroll(params);
      const rows = res.data.data?.items || [];
      if (rows.length === 0) { toast.error('Không có dữ liệu bảng lương cho kỳ này'); return; }
      setPreviewRows(rows);
      setStep('preview');
    } catch { toast.error('Lỗi khi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    printHTML(previewRows, thang, nam, mode === 'all');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={step === 'preview' ? 'md' : 'sm'} fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PictureAsPdfIcon color="error" />
          <Typography fontWeight={700}>{step === 'form' ? 'Xuất phiếu lương' : 'Xem trước phiếu lương'}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {step === 'form' ? (
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Chế độ xuất</InputLabel>
              <Select value={mode} label="Chế độ xuất" onChange={(e) => setMode(e.target.value)}>
                <MenuItem value="single">Một nhân viên</MenuItem>
                <MenuItem value="all">Toàn bộ nhân viên</MenuItem>
              </Select>
            </FormControl>
            {mode === 'single' && (
              <SearchableEmployeeSelect
                value={maNV}
                onChange={(e) => setMaNV(e.target.value)}
                employees={employees}
                size="small"
              />
            )}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tháng</InputLabel>
                <Select value={thang} label="Tháng" onChange={(e) => setThang(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select value={nam} label="Năm" onChange={(e) => setNam(e.target.value)}>
                  {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                {mode === 'single'
                  ? '📄 Xuất phiếu lương cho nhân viên được chọn trong kỳ tháng/năm.'
                  : '📋 Xuất bảng tổng hợp lương toàn bộ nhân viên trong kỳ tháng/năm.'}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Chip label={mode === 'all' ? `${previewRows.length} nhân viên` : previewRows[0]?.nhanVien?.TenNV} color="primary" size="small" variant="outlined" />
              <Typography variant="caption" color="text.secondary">Xem trước trước khi in / xuất PDF</Typography>
            </Box>
            <PayslipPreview rows={previewRows} thang={thang} nam={nam} bulk={mode === 'all'} />
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {step === 'preview' && <Button variant="outlined" onClick={() => setStep('form')}>← Quay lại</Button>}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="outlined" color="inherit">Hủy</Button>
        {step === 'form' ? (
          <Button variant="contained" startIcon={<VisibilityIcon />} onClick={handlePreview} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem trước'}
          </Button>
        ) : (
          <Button variant="contained" color="error" startIcon={<PrintIcon />} onClick={handlePrint}>
            In / Xuất PDF
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── Payroll page ─────────────────────────────────────────────────────────────

const Payroll = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [previewRow, setPreviewRow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterThang, setFilterThang] = useState('');
  const [filterNam, setFilterNam] = useState('');
  const [autoCalcOpen, setAutoCalcOpen] = useState(false);
  const [autoCalcLoading, setAutoCalcLoading] = useState(false);
  const [autoCalcThang, setAutoCalcThang] = useState(new Date().getMonth() + 1);
  const [autoCalcNam, setAutoCalcNam] = useState(new Date().getFullYear());
  const canManage = ['Admin', 'Ketoan'].includes(user?.PhanQuyen);

  const fetchData = useCallback(async () => {
    try {
      const params = { page: page + 1, limit: 10 };
      if (!canManage) params.MaNV1 = user.MaNV1;
      if (search) params.search = search;
      if (filterThang) params.Thang = filterThang;
      if (filterNam) params.Nam = filterNam;
      const res = await getPayroll(params);
      setData(res.data.data);
    } catch { /* silent */ }
  }, [page, user, search, filterThang, filterNam, canManage]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [search, filterThang, filterNam]);
  useEffect(() => {
    if (canManage) getEmployees({ limit: 1000 }).then((r) => setEmployees(r.data.data?.items || []));
  }, [canManage]);

  const handleCalculate = async (formData) => {
    try {
      await calculatePayroll({ ...formData, LuongCB: +formData.LuongCB, PhuCap: +(formData.PhuCap || 0), Thang: +formData.Thang, Nam: +formData.Nam });
      toast.success('Tính lương thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa bảng lương này?', '');
    if (r.isConfirmed) {
      try { await deletePayroll(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  const handleAutoCalc = async () => {
    setAutoCalcLoading(true);
    try {
      const res = await autoCalculatePayroll({ thang: autoCalcThang, nam: autoCalcNam });
      const { created, skipped, message, duAns } = res.data.data;
      const duAnStr = duAns?.length ? `\nDự án: ${duAns.join(', ')}` : '';
      if (created > 0) {
        toast.success(`${message}${duAnStr}`);
        fetchData();
      } else if (skipped > 0) {
        toast.warning(`${message}${duAnStr}`);
      } else {
        toast.info(message);
      }
      setAutoCalcOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi tính lương tự động');
    } finally {
      setAutoCalcLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Bảng lương" subtitle={`${data.total} bản ghi`}
        action={canManage && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => setExportOpen(true)}>
              Xuất phiếu lương
            </Button>
            <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={() => setAutoCalcOpen(true)}>
              Tính lương tự động
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Tính lương
            </Button>
          </Stack>
        )}
      />

      <Card>
        <Stack direction="row" spacing={2} sx={{ p: 2, flexWrap: 'wrap' }}>
          {canManage && (
            <TextField placeholder="Tìm theo tên nhân viên..." size="small" value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tháng</InputLabel>
            <Select value={filterThang} label="Tháng" onChange={(e) => setFilterThang(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Năm</InputLabel>
            <Select value={filterNam} label="Năm" onChange={(e) => setFilterNam(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell sx={{ minWidth: 280 }}>Nhân viên</TableCell>
                <TableCell>Tháng/Năm</TableCell>
                <TableCell align="right">Lương CB</TableCell>
                <TableCell align="right">Phụ cấp</TableCell>
                <TableCell align="right">Thuế TNCN (10%)</TableCell>
                <TableCell align="right">Phí BH (10,5%)</TableCell>
                <TableCell align="right" sx={{ minWidth: 110 }}>Biến động</TableCell>
                <TableCell align="right">Thực lĩnh</TableCell>
                <TableCell align="center" sx={{ minWidth: 100 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow><TableCell colSpan={9}><EmptyState message="Chưa có bảng lương" /></TableCell></TableRow>
              ) : data.items.map((bl) => (
                <TableRow key={bl.MaBL} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: 12 }}>{getInitials(bl.nhanVien?.TenNV)}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{bl.nhanVien?.TenNV}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bl.nhanVien?.chucVu?.TenCV || ''}{bl.nhanVien?.phongBan?.TenPB ? ` · ${bl.nhanVien.phongBan.TenPB}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>T{bl.Thang}/{bl.Nam}</TableCell>
                  <TableCell align="right">{formatCurrency(bl.LuongCB)}</TableCell>
                  <TableCell align="right">{formatCurrency(bl.PhuCap)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>−{formatCurrency(bl.ThueTNCN)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {(() => {
                      const { bhxh, bhyt, bhtn } = calcBH(bl);
                      return `−${formatCurrency(bhxh + bhyt + bhtn)}`;
                    })()}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} sx={{ color: (bl.TongBienDong ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                      {(bl.TongBienDong ?? 0) >= 0 ? '+' : '−'}{formatCurrency(Math.abs(bl.TongBienDong ?? 0))}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatCurrency(calcBH(bl).thucLinh)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0.5}>
                      <Tooltip title="Xem trước & in phiếu lương">
                        <IconButton size="small" color="primary" onClick={() => setPreviewRow(bl)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canManage && (
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(bl.MaBL)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>

      {/* Dialog xem trước nhanh từ 1 hàng */}
      <Dialog open={!!previewRow} onClose={() => setPreviewRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon color="error" />
            <Typography fontWeight={700}>Xem trước phiếu lương</Typography>
          </Box>
          <IconButton size="small" onClick={() => setPreviewRow(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {previewRow && <PayslipPreview rows={[previewRow]} thang={previewRow.Thang} nam={previewRow.Nam} bulk={false} />}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPreviewRow(null)} variant="outlined" color="inherit">Đóng</Button>
          <Button variant="contained" color="error" startIcon={<PrintIcon />}
            onClick={() => { printHTML([previewRow], previewRow.Thang, previewRow.Nam, false); setPreviewRow(null); }}>
            In / Xuất PDF
          </Button>
        </DialogActions>
      </Dialog>

      <PayrollForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleCalculate} employees={employees} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} employees={employees} filterThang={filterThang} filterNam={filterNam} />

      {/* Dialog tính lương tự động theo tháng */}
      <Dialog open={autoCalcOpen} onClose={() => !autoCalcLoading && setAutoCalcOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tính lương tự động</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hệ thống sẽ tự động tạo bảng lương cho tất cả nhân viên tham gia dự án trong tháng được chọn.
            Nếu tháng đó không có dự án nào đang thực hiện sẽ bỏ qua.
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tháng</InputLabel>
              <Select value={autoCalcThang} label="Tháng" onChange={(e) => setAutoCalcThang(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Năm</InputLabel>
              <Select value={autoCalcNam} label="Năm" onChange={(e) => setAutoCalcNam(e.target.value)}>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i + 1).map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAutoCalcOpen(false)} variant="outlined" disabled={autoCalcLoading}>Hủy</Button>
          <Button
            onClick={handleAutoCalc}
            variant="contained"
            disabled={autoCalcLoading}
            startIcon={<AutorenewIcon />}
          >
            {autoCalcLoading ? 'Đang xử lý...' : 'Tính lương'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll;
