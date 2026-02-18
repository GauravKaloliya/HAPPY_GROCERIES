import React, { useState, useEffect } from 'react';

// Global toast state
let showToastCallback = null;

export const showToast = (message) => {
  if (showToastCallback) {
    showToastCallback(message);
  }
};

const Toast = () => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastCallback = (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    return () => {
      showToastCallback = null;
    };
  }, []);

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Toast;
