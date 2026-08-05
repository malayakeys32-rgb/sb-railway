// src/components/Dock.jsx
import React from 'react';
import './Dock.css';

export default function Dock() {
  const icons = ['gear', 'shield', 'crosshair', 'envelope', 'lock'];
  return (
    <div className="dock">
      <h2 className="logo">SENTINEL‑BLACK</h2>
      <div className="dock-icons">
        {icons.map(icon => (
          <img key={icon} src={`/assets/icons/${icon}.svg`} alt={icon} className="holo-icon" />
        ))}
      </div>
    </div>
  );
}
