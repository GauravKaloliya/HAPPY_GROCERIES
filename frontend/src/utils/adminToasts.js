import toast from 'react-hot-toast';

export const showAdminSuccess = (message) => {
  toast.success(message);
};

export const showAdminWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#ffe08a',
      color: '#5c4300',
      borderRadius: '15px',
      padding: '12px 14px',
      boxShadow: 'var(--shadow-hover)',
      fontWeight: 700,
    },
  });
};

export const showAdminError = (message) => {
  toast.error(message);
};
