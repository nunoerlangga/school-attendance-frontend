import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'default' }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return { bg: '#dcfce7', color: '#16a34a' }; // text hijau
      case 'danger':
        return { bg: '#fee2e2', color: '#dc2626' }; // text merah
      case 'warning':
        return { bg: '#fef3c7', color: '#d97706' }; // text kuning
      case 'info':
        return { bg: '#e0e7ff', color: '#4f46e5' };
      default:
        return { bg: '#f1f5f9', color: '#64748b' }; // netral
    }
  };

  const style = getStyles();

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      padding: '0.25rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

export default Badge;
