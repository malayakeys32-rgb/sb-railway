import React from "react";
import "../styles/hologram.css";

export default function Sidebar() {
  return (
    <div className="sb-sidebar">
      <div className="sb-globe">
        <img src="/assets/globe.gif" alt="globe" className="globe-holo" />
      </div>

      <div className="sb-nav">
        <div className="sb-item">
          <img src="/assets/icons/home.svg" alt="home" />
          <span>HOME</span>
        </div>

        <div className="sb-item">
          <img src="/assets/icons/shield.svg" alt="security" />
          <span>SECURITY</span>
        </div>

        <div className="sb-item">
          <img src="/assets/icons/vault.svg" alt="vault" />
          <span>VAULT</span>
        </div>

        <div className="sb-item">
          <img src="/assets/icons/network.svg" alt="network" />
          <span>NETWORK</span>
        </div>
      </div>
    </div>
  );
}
