import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const useToast = () => ({
  success: (msg) => Toast.fire({ icon: 'success', title: msg }),
  error: (msg) => Toast.fire({ icon: 'error', title: msg }),
  warning: (msg) => Toast.fire({ icon: 'warning', title: msg }),
  confirm: (title, text) =>
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      customClass: { container: 'swal-on-top' },
    }),
});

export default useToast;
