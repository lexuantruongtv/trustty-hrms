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
        <div class="header-row">
          <div class="header-left">
            <div class="company-name">Công ty Phần mềm TrustTY</div>
            <div class="so-phieu">Số: ${bl.MaNV1}/${bl.Nam}/${String(bl.Thang).padStart(2,'0')}/PL</div>
          </div>
          <div class="header-right">
            <div class="quoc-hieu">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
            <div class="doc-lap">Độc lập – Tự do – Hạnh phúc</div>
            <hr class="header-rule">
          </div>
        </div>

        <div class="doc-title">Phiếu lương nhân viên</div>
        <div class="doc-subtitle">Tháng ${bl.Thang} năm ${bl.Nam}</div>
        <div class="date-line">Hà Nội, ${today}</div>

        <div class="section-title">I. THÔNG TIN NHÂN VIÊN</div>
        <table class="info-table">
          <tr><td class="info-label">Họ và tên:</td><td class="info-val">${bl.nhanVien?.TenNV || '—'}</td><td class="info-label">Mã nhân viên:</td><td class="info-val">${bl.MaNV1}</td></tr>
          <tr><td class="info-label">Chức vụ:</td><td class="info-val">${bl.nhanVien?.chucVu?.TenCV || '—'}</td><td class="info-label">Phòng ban:</td><td class="info-val">${bl.nhanVien?.phongBan?.TenPB || '—'}</td></tr>
          <tr><td class="info-label">Số tài khoản:</td><td class="info-val" colspan="3">${bl.nhanVien?.SoTaiKhoanNN || '—'}</td></tr>
        </table>

        <div class="section-title">II. CHI TIẾT LƯƠNG</div>
        <table class="detail-table">
          <thead>
            <tr><th class="stt">STT</th><th>KHOẢN MỤC</th><th style="width:160px;text-align:right">SỐ TIỀN (VNĐ)</th></tr>
          </thead>
          <tbody>
            <tr class="group-header"><td colspan="3">A. THU THẬP</td></tr>
            ${incomeRows.map(([s, l, v]) => `<tr><td class="stt">${s}</td><td>${l}</td><td class="amount">${v}</td></tr>`).join('')}
            <tr class="group-header"><td colspan="3">B. CÁC KHOẢN KHẤU TRỪ</td></tr>
            ${deductRows.map(([s, l, v]) => `<tr><td class="stt">${s}</td><td>${l}</td><td class="amount">${v}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="total-box">
          <span class="total-label">Tổng thực lĩnh</span>
          <span class="total-val">${fmtVND(thucLinh)}</span>
        </div>

        <div class="sign-row">
          <div class="sign-col"><div class="sign-name">Người nhận lương</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Kế toán</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Giám đốc</div><div class="sign-hint">(Ký, đóng dấu)</div><div class="sign-line"></div></div>
        </div>
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
        <div class="header-row">
          <div class="header-left">
            <div class="company-name">Công ty Phần mềm TrustTY</div>
          </div>
          <div class="header-right">
            <div class="quoc-hieu">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
            <div class="doc-lap">Độc lập – Tự do – Hạnh phúc</div>
            <hr class="header-rule">
          </div>
        </div>
        <div class="doc-title">Bảng tổng hợp lương tháng ${thang}/${nam}</div>
        <div class="date-line">Hà Nội, ${today}</div>

        <table class="detail-table bulk-table">
          <thead>
            <tr>${headerCols.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>

        <div class="sign-row" style="margin-top:40px">
          <div class="sign-col"><div class="sign-name">Người lập phiếu</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Kế toán trưởng</div><div class="sign-hint">(Ký, ghi rõ họ tên)</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="sign-name">Giám đốc</div><div class="sign-hint">(Ký, đóng dấu)</div><div class="sign-line"></div></div>
        </div>
      </div>`;
  };

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; background: #fff; }
    .slip { max-width: 760px; margin: 0 auto; padding: 28px 40px; }
    .slip.bulk { max-width: 1050px; }

    /* Quốc hiệu - Tiêu ngữ */
    .header { text-align: center; margin-bottom: 6px; }
    .company-name { font-weight: bold; font-size: 13pt; text-transform: uppercase; }
    .quoc-hieu { font-weight: bold; font-size: 13pt; text-transform: uppercase; }
    .doc-lap { font-size: 13pt; }
    .header-rule { border: none; border-top: 1px solid #000; width: 220px; margin: 3px auto 0; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .header-left { text-align: center; }
    .header-right { text-align: center; }
    .so-phieu { font-size: 12pt; margin-top: 4px; }

    /* Tiêu đề văn bản */
    .doc-title { text-align: center; font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 14px 0 4px; }
    .doc-subtitle { text-align: center; font-size: 13pt; font-style: italic; margin-bottom: 16px; }
    .date-line { text-align: right; font-size: 12pt; font-style: italic; margin-bottom: 14px; }

    /* Section titles */
    .section-title { font-size: 13pt; font-weight: bold; margin: 14px 0 6px; }

    /* Info grid */
    .info-table { width: 100%; margin-bottom: 8px; font-size: 13pt; }
    .info-table td { padding: 3px 6px; vertical-align: top; }
    .info-label { font-weight: normal; width: 160px; white-space: nowrap; }
    .info-val { font-weight: bold; }

    /* Detail table */
    .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12pt; }
    .detail-table th { border: 1px solid #000; padding: 6px 8px; text-align: center; font-weight: bold; background: #f0f0f0; }
    .detail-table td { border: 1px solid #000; padding: 5px 8px; }
    .detail-table tr:nth-child(even) td { background: #fafafa; }
    .group-header td { font-weight: bold; text-transform: uppercase; font-size: 11pt; background: #e8e8e8 !important; text-align: center; }
    .stt { width: 32px; text-align: center; }
    .amount { text-align: right; white-space: nowrap; }
    .deduct { }
    .income { }

    /* Total box */
    .total-box { border: 2px solid #000; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; margin: 12px 0 24px; }
    .total-label { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
    .total-val { font-size: 14pt; font-weight: bold; }

    /* Total words */
    .total-words { font-style: italic; font-size: 12pt; margin-bottom: 24px; }

    /* Signature */
    .sign-row { display: flex; justify-content: space-around; margin-top: 16px; }
    .sign-col { text-align: center; min-width: 160px; }
    .sign-name { font-weight: bold; font-size: 13pt; }
    .sign-hint { font-size: 12pt; font-style: italic; margin-top: 2px; }
    .sign-line { border-top: 1px solid #000; margin-top: 60px; width: 140px; margin-left: auto; margin-right: auto; }

    /* Bulk table */
    .bulk-table th, .bulk-table td { font-size: 11pt; padding: 5px 6px; }

    /* Page break */
    .page-break { page-break-after: always; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .slip { padding: 16px 24px; }
      @page { margin: 15mm; ${bulk ? 'size: A4 landscape;' : 'size: A4 portrait;'} }
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
            {/* Quốc hiệu - Tiêu ngữ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Công ty Cổ phần TrustTY</Typography>
                <Typography variant="caption" color="text.secondary">Số: {bl.MaNV1}/{bl.Nam}/{String(bl.Thang).padStart(2,'0')}/PL</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Cộng hòa xã hội chủ nghĩa Việt Nam</Typography>
                <Typography variant="body2">Độc lập – Tự do – Hạnh phúc</Typography>
                <Box sx={{ borderBottom: '1px solid #000', width: 200, mx: 'auto', mt: 0.25 }} />
              </Box>
            </Box>

            {/* Tiêu đề */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Phiếu lương nhân viên</Typography>
              <Typography variant="body2" fontStyle="italic">Tháng {bl.Thang} năm {bl.Nam}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mb: 1.5, fontStyle: 'italic' }}>
              Hà Nội, {todayStr()}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* I. Thông tin NV */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>I. Thông tin nhân viên</Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
              {[
                ['Họ và tên', bl.nhanVien?.TenNV],
                ['Mã nhân viên', bl.MaNV1],
                ['Chức vụ', bl.nhanVien?.chucVu?.TenCV || '—'],
                ['Phòng ban', bl.nhanVien?.phongBan?.TenPB || '—'],
                ['Số tài khoản', bl.nhanVien?.SoTaiKhoanNN || '—'],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, flexShrink: 0 }}>{label}:</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}</Typography>
                </Box>
              ))}
            </Box>

            {/* II. Chi tiết lương */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>II. Chi tiết lương</Typography>
            <TableContainer sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 700, width: 36 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Khoản mục</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Số tiền (VNĐ)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: 12, py: 0.75 }}>A. Thu nhập</TableCell>
                  </TableRow>
                  {incomeRows.map((row) => (
                    <TableRow key={row.stt}>
                      <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 12 }}>{row.stt}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: row.sign === '+' ? 'success.main' : 'text.primary' }}>
                        {row.sign}{formatCurrency(row.val)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#fff5f5' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: 12, py: 0.75 }}>B. Các khoản khấu trừ</TableCell>
                  </TableRow>
                  {deductRows.map((row, i) => (
                    <TableRow key={row.label}>
                      <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 12 }}>{incomeRows.length + i + 1}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>−{formatCurrency(row.val)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Tổng thực lĩnh */}
            <Box sx={{ border: '2px solid', borderColor: 'text.primary', px: 2, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Tổng thực lĩnh</Typography>
              <Typography variant="h6" fontWeight={800}>{formatCurrency(thucLinh)}</Typography>
            </Box>

            {/* Ký tên */}
            <Stack direction="row" justifyContent="space-around">
              {[['Người nhận lương', '(Ký, ghi rõ họ tên)'], ['Kế toán', '(Ký, ghi rõ họ tên)'], ['Giám đốc', '(Ký, đóng dấu)']].map(([role, hint]) => (
                <Box key={role} sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="body2" fontWeight={700}>{role}</Typography>
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">{hint}</Typography>
                  <Box sx={{ borderBottom: '1px solid #999', mt: 6, width: 120, mx: 'auto' }} />
                </Box>
              ))}
            </Stack>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('single'); setMaNV('');
      setThang(filterThang || new Date().getMonth() + 1);
      setNam(filterNam || currentYear);
    }
  }, [open, filterThang, filterNam]);

  const handlePrint = async () => {
    if (!thang || !nam) { toast.error('Vui lòng chọn tháng và năm'); return; }
    if (mode === 'single' && !maNV) { toast.error('Vui lòng chọn nhân viên'); return; }
    setLoading(true);
    try {
      const params = { page: 1, limit: 1000, Thang: thang, Nam: nam };
      if (mode === 'single') params.MaNV1 = maNV;
      const res = await getPayroll(params);
      const rows = res.data.data?.items || [];
      if (rows.length === 0) { toast.error('Không có dữ liệu bảng lương cho kỳ này'); return; }
      printHTML(rows, thang, nam, mode === 'all');
      onClose();
    } catch { toast.error('Lỗi khi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrintIcon color="primary" />
          <Typography fontWeight={700}>In phiếu lương</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Chế độ in</InputLabel>
            <Select value={mode} label="Chế độ in" onChange={(e) => setMode(e.target.value)}>
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
                ? '📄 In phiếu lương cho nhân viên được chọn trong kỳ tháng/năm.'
                : '📋 In bảng tổng hợp lương toàn bộ nhân viên trong kỳ tháng/năm.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Hủy</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} disabled={loading}>
          {loading ? 'Đang tải...' : 'In phiếu lương'}
        </Button>
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
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => setExportOpen(true)}>
              In phiếu lương
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
                <TableCell align="right" sx={{ minWidth: 130 }}>Lương cơ bản</TableCell>
                <TableCell align="right">Phụ cấp</TableCell>
                <TableCell align="right">Thuế TNCN (10%)</TableCell>
                <TableCell align="right">Phí BH (10,5%)</TableCell>
                <TableCell align="right" sx={{ minWidth: 110 }}>Biến động</TableCell>
                <TableCell align="right">Thực lĩnh</TableCell>
                {canManage && <TableCell align="center" sx={{ minWidth: 100 }}>Thao tác</TableCell>}
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
                  {canManage && (
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.5}>
                        <Tooltip title="In phiếu lương">
                          <IconButton size="small" color="primary"
                            onClick={() => printHTML([bl], bl.Thang, bl.Nam, false)}>
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(bl.MaBL)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>

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
