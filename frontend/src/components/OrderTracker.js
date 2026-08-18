import React, { useState, useEffect, useRef } from 'react';
import './OrderTracker.css';

// Custom inline SVG icons for pins
const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const STATUS_STEPS = [
  { status: 'order placed', title: 'Order Placed', desc: 'Order received.', icon: ShoppingBagIcon, percent: 0.0 },
  { status: 'order confirmed', title: 'Order Confirmed', desc: 'Order accepted.', icon: ShoppingBagIcon, percent: 0.14 },
  { status: 'order packed', title: 'Order Packed', desc: 'Packed safely.', icon: ShoppingBagIcon, percent: 0.28 },
  { status: 'Pickuped', title: 'Picked Up', desc: 'Courier picked up.', icon: TruckIcon, percent: 0.42 },
  { status: 'Shipping', title: 'Shipping', desc: 'In transit.', icon: TruckIcon, percent: 0.57 },
  { status: 'Reached', title: 'Reached Hub', desc: 'Arrived at hub.', icon: TruckIcon, percent: 0.71 },
  { status: 'Out for delivery', title: 'Out for Delivery', desc: 'Courier nearby.', icon: TruckIcon, percent: 0.85 },
  { status: 'Delivery', title: 'Delivered', desc: 'Package delivered.', icon: CheckIcon, percent: 1.0 }
];

const normalizeStatus = (status) => {
  if (!status) return 'order placed';
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'paid') return 'order placed';
  if (s === 'shipped') return 'Shipping';
  if (s === 'delivered') return 'Delivery';
  return status;
};

export default function OrderTracker({ order, showToast }) {
  const [currentStatus, setCurrentStatus] = useState(normalizeStatus(order?.status));
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scooterPos, setScooterPos] = useState({ x: 100, y: 150, angle: 0 });
  const [pathLength, setPathLength] = useState(480);
  const [stepsWithCoords, setStepsWithCoords] = useState(
    STATUS_STEPS.map(step => ({ ...step, x: 0, y: 0 }))
  );
  
  const pathRef = useRef(null);
  const isCancelled = order?.status === 'cancelled';

  // 1. Calculate path length and pin coordinates dynamically on mount
  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    setPathLength(totalLength);

    const calculated = STATUS_STEPS.map(step => {
      const pt = path.getPointAtLength(totalLength * step.percent);
      return {
        ...step,
        x: pt.x,
        y: pt.y
      };
    });
    setStepsWithCoords(calculated);
  }, []);

  // Helper to map status to target progress percentage
  const getStatusPercentage = (status) => {
    if (isCancelled) return 0.0;
    const step = STATUS_STEPS.find(s => s.status.toLowerCase() === status.toLowerCase());
    return step ? step.percent : 0.0;
  };

  // 2. Track scooter coordinate & angle along the Bezier curve
  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    const currentLength = totalLength * animatedProgress;
    
    // Safety boundaries
    const safeLength = Math.max(0, Math.min(currentLength, totalLength));
    const point = path.getPointAtLength(safeLength);

    // Calculate rotation angle using a tiny forward offset
    const delta = 1;
    const nextPoint = path.getPointAtLength(Math.min(safeLength + delta, totalLength));
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

    setScooterPos({ x: point.x, y: point.y, angle });
  }, [animatedProgress, pathLength]);

  // 3. Animate progress values from previous location to target location
  useEffect(() => {
    if (isCancelled) {
      setAnimatedProgress(0);
      return;
    }

    const target = getStatusPercentage(currentStatus);
    const startVal = animatedProgress;
    const diff = target - startVal;

    if (diff === 0) return;

    setIsAnimating(true);
    let startTimestamp = null;
    const duration = 2200; // 2.2 seconds animation
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: cubic easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + diff * eased;
      
      setAnimatedProgress(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    const delayTimer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStatus, isCancelled]);

  // Listen to order prop updates (e.g. from database / admin changes)
  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(normalizeStatus(order.status));
    }
  }, [order?.status]);

  // Handle simulation clicking
  const handleSimulateStatus = (status) => {
    if (isCancelled) {
      if (showToast) showToast("Cancelled orders cannot be simulated");
      return;
    }
    setCurrentStatus(status);
    if (showToast) {
      showToast(`Simulating status: ${status.toUpperCase()}`);
    }
  };

  const getStatusTitle = (status) => {
    const step = STATUS_STEPS.find(s => s.status.toLowerCase() === status.toLowerCase());
    return step ? step.title : 'Order Processing';
  };

  return (
    <div className="order-tracker-container">
      {/* Header Info */}
      <div className="order-tracker-title-row">
        <div>
          <h4>
            {isCancelled ? 'Order Cancelled' : getStatusTitle(currentStatus)} 
            <span>• Order #{order?.id}</span>
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Placed on {new Date(order?.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
        <div>
          <span className={`status-badge status-${order?.status || 'pending'}`}>
            {order?.status || 'pending'}
          </span>
        </div>
      </div>

      {isCancelled && (
        <div className="order-tracker-cancelled-msg">
          <AlertCircleIcon />
          <span>This order was cancelled. Refund has been initiated if paid online.</span>
        </div>
      )}

      {/* SVG Map Layout */}
      <div className="tracker-map-wrapper">
        <svg 
          viewBox="0 0 600 220" 
          className={`tracker-svg ${isCancelled ? 'cancelled' : ''}`}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="activePathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-pending, #dfa838)" />
              <stop offset="50%" stopColor="var(--color-shipped, #3a3a3a)" />
              <stop offset="100%" stopColor="var(--color-delivered, #10b981)" />
            </linearGradient>
          </defs>

          {/* 1. Underlying path: dotted path representing the whole road */}
          <path
            d="M 100 150 C 180 150, 240 140, 320 140 C 410 140, 440 110, 460 85 C 475 65, 490 50, 500 50"
            fill="none"
            stroke="var(--border-color, #E0E0E0)"
            strokeWidth="4"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* 2. Active path: solid highlight indicating distance traveled */}
          <path
            ref={pathRef}
            d="M 100 150 C 180 150, 240 140, 320 140 C 410 140, 440 110, 460 85 C 475 65, 490 50, 500 50"
            fill="none"
            stroke="url(#activePathGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            className="tracker-path-active"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - pathLength * animatedProgress}
          />

          {/* 3. Status Milestone Pins */}
          {stepsWithCoords.map((step, idx) => {
            const Icon = step.icon;
            const isStepActive = animatedProgress >= (step.percent - 0.02);
            
            // Check if this step is the current rest target
            const isCurrentRest = currentStatus.toLowerCase() === step.status.toLowerCase() && !isAnimating;

            return (
              <g key={step.status} className="map-pin" transform={`translate(${step.x}, ${step.y})`}>
                {/* Pulse glow if currently active or resting */}
                {isStepActive && isCurrentRest && (
                  <circle cx="0" cy="0" r="10" fill={idx === 7 ? 'var(--color-delivered)' : 'var(--color-pending)'} opacity="0.3" className="map-pin-pulse" />
                )}
                <ellipse cx="0" cy="2" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />
                <path 
                  d="M0 -36 C-11 -36 -20 -27 -20 -16 C-20 -4 0 10 0 10 C0 10 20 -4 20 -16 C20 -27 11 -36 0 -36 Z" 
                  fill={isStepActive ? (idx === 7 ? 'var(--color-delivered)' : 'var(--brand-purple, #1b4332)') : 'var(--text-muted)'} 
                />
                <circle cx="0" cy="-17" r="7.5" fill="#FFF" />
                <g transform="translate(-7, -24)" color={isStepActive ? (idx === 7 ? 'var(--color-delivered)' : 'var(--brand-purple, #1b4332)') : 'var(--text-muted)'}>
                  <Icon />
                </g>
              </g>
            );
          })}

          {/* 4. Animated Delivery Scooter Icon */}
          {!isCancelled && (
            <g 
              className="scooter-group"
              transform={`translate(${scooterPos.x}, ${scooterPos.y}) rotate(${scooterPos.angle})`}
            >
              <g className={isAnimating ? 'scooter-riding' : 'scooter-idle'}>
                <ellipse cx="14" cy="24" rx="10" ry="2.5" fill="rgba(0,0,0,0.2)" />
                
                <g fill="var(--brand-orange, #8B6F47)">
                  <path d="M22 17h-1.5c-.3 0-.5-.2-.5-.5v-4c0-.8-.7-1.5-1.5-1.5H15v-2h2c.6 0 1-.4 1-1s-.4-1-1-1h-4c-.6 0-1 .4-1 1s.4 1 1 1h1v2H9c-.8 0-1.5.7-1.5 1.5v4c0 .3-.2.5-.5.5H5c-.6 0-1 .4-1 1s.4 1 1 1h17c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  <rect x="5" y="7" width="7" height="8" rx="1.5" fill="var(--text-primary)" />
                  <rect x="7.5" y="9.5" width="2" height="3" fill="#FFF" opacity="0.3" />
                  
                  <circle cx="8" cy="20" r="3.5" stroke="var(--text-primary)" strokeWidth="1.5" fill="#FFF" />
                  <circle cx="20" cy="20" r="3.5" stroke="var(--text-primary)" strokeWidth="1.5" fill="#FFF" />
                  <circle cx="8" cy="20" r="1" fill="var(--text-primary)" />
                  <circle cx="20" cy="20" r="1" fill="var(--text-primary)" />
                  
                  <path d="M19.5 9h1c.3 0 .5-.2.5-.5V5.5c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5V8.5c0 .3.2.5.5.5z" fill="#0d9488" opacity="0.75" />
                  <path d="M22.5 7.5l3.5-.5v2z" fill="#fbc531" opacity={isAnimating ? 0.9 : 0.4} />
                </g>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Timeline Steps Info Card */}
      <div className="tracker-timeline-grid">
        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isStepActive = animatedProgress >= (step.percent - 0.02);
          const isStepCurrent = currentStatus.toLowerCase() === step.status.toLowerCase();
          
          return (
            <div key={step.status} className={`timeline-step ${isStepActive ? 'active' : ''} ${isStepCurrent ? 'current' : ''}`}>
              <div className="timeline-step-icon">
                <Icon />
              </div>
              <div>
                <div className="timeline-step-title">{step.title}</div>
                <div className="timeline-step-desc">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Developer Simulation Bar */}
      <div className="simulation-bar">
        <span className="simulation-label">Dev Test Controls:</span>
        {STATUS_STEPS.map(step => (
          <button 
            key={step.status}
            onClick={() => handleSimulateStatus(step.status)} 
            className={`simulation-btn ${currentStatus.toLowerCase() === step.status.toLowerCase() ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '4px 8px', margin: '2px' }}
          >
            {step.title}
          </button>
        ))}
      </div>

      {/* Delivery details */}
      <div style={{ marginTop: '2rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>Deliver To:</strong>
            <div style={{ marginTop: '0.2rem', fontWeight: 600 }}>{order?.customer_name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{order?.customer_address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Payment Mode:</strong>
            <div style={{ marginTop: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>COD / Card Online</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Paid: ₹{parseFloat(order?.total_amount).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
