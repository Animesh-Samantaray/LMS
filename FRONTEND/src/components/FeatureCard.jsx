import React from 'react';

const FeatureCard = ({ icon: Icon, title, description, badgeText }) => {
  return (
    <div className="glass-card feature-card">
      <div>
        <div className="feature-icon-box">
          {Icon && <Icon size={26} />}
        </div>
        {badgeText && (
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            {badgeText}
          </span>
        )}
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
