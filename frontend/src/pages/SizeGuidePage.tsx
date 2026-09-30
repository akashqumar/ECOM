import React, { useState } from 'react';
import { Ruler, Sparkles, Check, Info } from 'lucide-react';

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [gender, setGender] = useState<'men' | 'women'>('women');

  // Men's Tops: inches
  const menTopsInches = [
    { size: 'XS', chest: '34–36', waist: '28–30', neck: '14.5', sleeve: '32.5' },
    { size: 'S',  chest: '36–38', waist: '30–32', neck: '15.0', sleeve: '33.0' },
    { size: 'M',  chest: '39–41', waist: '32–34', neck: '15.5', sleeve: '34.0' },
    { size: 'L',  chest: '42–44', waist: '34–36', neck: '16.5', sleeve: '35.0' },
    { size: 'XL', chest: '45–47', waist: '37–39', neck: '17.5', sleeve: '36.0' },
    { size: 'XXL', chest: '48–50', waist: '40–42', neck: '18.5', sleeve: '36.5' },
  ];

  // Women's Tops: inches
  const womenTopsInches = [
    { size: 'XS', bust: '32–33', waist: '24–25', hips: '34–35', us: '0–2' },
    { size: 'S',  bust: '34–35', waist: '26–27', hips: '36–37', us: '4–6' },
    { size: 'M',  bust: '36–37', waist: '28–29', hips: '38–39', us: '8–10' },
    { size: 'L',  bust: '38–40', waist: '30–32', hips: '40–42', us: '12–14' },
    { size: 'XL', bust: '41–43', waist: '33–35', hips: '43–45', us: '16' },
  ];

  // Helper converter: inches range to cm
  const toCm = (val: string) => {
    if (val.includes('–')) {
      const [min, max] = val.split('–').map(v => parseFloat(v));
      return `${Math.round(min * 2.54)}–${Math.round(max * 2.54)}`;
    }
    const num = parseFloat(val);
    return isNaN(num) ? val : `${Math.round(num * 2.54)}`;
  };

  return (
    <div className="size-guide-page">
      {/* Hero Header */}
      <div className="guide-hero">
        <div className="guide-hero-tag">Fit & Sizing Architecture</div>
        <h1 className="guide-hero-title">Interactive Size Guide</h1>
        <p className="guide-hero-subtitle">
          Find your precision fit across Lumé tailored collections with standard international conversions.
        </p>

        {/* Controls: Gender & Unit Switchers */}
        <div className="guide-controls-row">
          <div className="segmented-control">
            <button 
              className={`seg-btn ${gender === 'women' ? 'active' : ''}`}
              onClick={() => setGender('women')}
            >
              Women's Apparel
            </button>
            <button 
              className={`seg-btn ${gender === 'men' ? 'active' : ''}`}
              onClick={() => setGender('men')}
            >
              Men's Apparel
            </button>
          </div>

          <div className="unit-toggle">
            <span className="unit-label">Units:</span>
            <button 
              className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
              onClick={() => setUnit('in')}
            >
              Inches (in)
            </button>
            <button 
              className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
              onClick={() => setUnit('cm')}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>
      </div>

      {/* Primary Table */}
      <div className="guide-table-card">
        <div className="table-header-bar">
          <h3>{gender === 'women' ? "Women's Garment Sizing" : "Men's Garment Sizing"}</h3>
          <span className="unit-badge">Measurements in {unit.toUpperCase()}</span>
        </div>

        <div className="table-responsive">
          <table className="guide-table">
            <thead>
              {gender === 'women' ? (
                <tr>
                  <th>Alpha Size</th>
                  <th>US Numeric</th>
                  <th>Bust ({unit})</th>
                  <th>Natural Waist ({unit})</th>
                  <th>Hips ({unit})</th>
                </tr>
              ) : (
                <tr>
                  <th>Alpha Size</th>
                  <th>Chest ({unit})</th>
                  <th>Waist ({unit})</th>
                  <th>Collar ({unit})</th>
                  <th>Sleeve Length ({unit})</th>
                </tr>
              )}
            </thead>
            <tbody>
              {gender === 'women'
                ? womenTopsInches.map(row => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.us}</td>
                      <td>{unit === 'cm' ? toCm(row.bust) : row.bust}</td>
                      <td>{unit === 'cm' ? toCm(row.waist) : row.waist}</td>
                      <td>{unit === 'cm' ? toCm(row.hips) : row.hips}</td>
                    </tr>
                  ))
                : menTopsInches.map(row => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{unit === 'cm' ? toCm(row.chest) : row.chest}</td>
                      <td>{unit === 'cm' ? toCm(row.waist) : row.waist}</td>
                      <td>{unit === 'cm' ? toCm(row.neck) : row.neck}</td>
                      <td>{unit === 'cm' ? toCm(row.sleeve) : row.sleeve}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurement Instructions */}
      <div className="guide-instruction-card">
        <h3 className="instruct-title">How to Measure Accurately</h3>
        <p className="instruct-subtitle">For optimal accuracy, measure over undergarments with a flexible fabric measuring tape held level.</p>

        <div className="instruct-grid">
          <div className="instruct-item">
            <div className="instruct-num">1</div>
            <h4>Chest / Bust</h4>
            <p>Measure around the fullest part of your chest, keeping the tape straight and snug under your arms.</p>
          </div>
          <div className="instruct-item">
            <div className="instruct-num">2</div>
            <h4>Natural Waist</h4>
            <p>Wrap the tape around your natural waistline, typically the narrowest point above your belly button.</p>
          </div>
          <div className="instruct-item">
            <div className="instruct-num">3</div>
            <h4>Hips</h4>
            <p>Stand with feet together and measure around the fullest curve of your hips and seat.</p>
          </div>
          <div className="instruct-item">
            <div className="instruct-num">4</div>
            <h4>Inseam</h4>
            <p>Measure from the lowest point of your crotch down the inner leg seam to the ankle hem.</p>
          </div>
        </div>
      </div>

      {/* Sizing Advisory */}
      <div className="guide-advisory-card">
        <Info size={20} className="advisory-icon" />
        <div>
          <h4>Between sizes?</h4>
          <p>
            If your measurements straddle two sizes, select the smaller size for a sculpted, fitted look, or the larger size for a relaxed, relaxed drape. All purchases are backed by our complimentary 30-day size exchange guarantee.
          </p>
        </div>
      </div>

      <style>{`
        .size-guide-page {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .guide-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .guide-hero-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 6px 14px;
          border-radius: var(--r-full);
          margin-bottom: 16px;
        }

        .guide-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .guide-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .guide-controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .segmented-control {
          display: inline-flex;
          background: var(--c-surface-raised);
          padding: 4px;
          border-radius: var(--r-full);
          border: 1px solid var(--glass-border);
        }

        .seg-btn {
          padding: 8px 20px;
          border-radius: var(--r-full);
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
          cursor: pointer;
          transition: all var(--transition);
        }

        .seg-btn.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .unit-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          padding: 4px 6px;
          border-radius: var(--r-full);
          border: 1px solid var(--glass-border);
        }

        .unit-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--c-text-3);
          margin-left: 6px;
        }

        .unit-btn {
          padding: 6px 14px;
          border-radius: var(--r-full);
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: var(--c-text-2);
          cursor: pointer;
          transition: all var(--transition);
        }

        .unit-btn.active {
          background: var(--c-surface-raised);
          color: var(--c-text-1);
          box-shadow: var(--shadow-xs);
        }

        .guide-table-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          border-radius: var(--r-xl);
          padding: 28px;
          margin-bottom: 36px;
        }

        .table-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .table-header-bar h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .unit-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 4px 10px;
          border-radius: var(--r-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .guide-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          text-align: left;
        }

        .guide-table th {
          padding: 12px 16px;
          background: var(--c-surface-raised);
          color: var(--c-text-1);
          font-weight: 600;
          border-bottom: 1px solid var(--glass-border);
        }

        .guide-table th:first-child {
          border-top-left-radius: var(--r-md);
        }

        .guide-table th:last-child {
          border-top-right-radius: var(--r-md);
        }

        .guide-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--c-border-subtle);
          color: var(--c-text-2);
        }

        .guide-instruction-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-xl);
          padding: 32px;
          margin-bottom: 32px;
        }

        .instruct-title {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .instruct-subtitle {
          margin: 0 0 28px;
          font-size: 14px;
          color: var(--c-text-2);
        }

        .instruct-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .instruct-item {
          padding: 20px;
          border-radius: var(--r-lg);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .instruct-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--c-accent-2);
        }

        .instruct-item h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .instruct-item p {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.5;
        }

        .guide-advisory-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px;
          border-radius: var(--r-xl);
          background: rgba(196, 151, 74, 0.08);
          border: 1px solid rgba(196, 151, 74, 0.2);
        }

        .advisory-icon {
          color: var(--c-accent-2);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .guide-advisory-card h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .guide-advisory-card p {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
