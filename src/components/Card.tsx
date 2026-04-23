import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, actions }) => {
  return (
    <div className="data-page" style={{ borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
      {(title || actions) && (
        <div className="card-header" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-info">
            {title && <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>{subtitle}</p>}
          </div>
          {actions && <div className="header-actions">{actions}</div>}
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
