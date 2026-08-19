import React, { useState, useEffect, useRef } from 'react';
import './OrderTracker.css';

// ─── 8 DETAILED, REALISTIC MULTI-LAYERED SVG ICONS ───

// 1. Placed: Shopping bag with gold accent handles & pocket detail
const ShoppingBagIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="bagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
    </defs>
    <path d="M16 22 L48 22 L44 54 L20 54 Z" fill="url(#bagGrad)" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))" />
    <path d="M24 22 C24 14, 40 14, 40 22" fill="none" stroke="#fbc531" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="36" r="6" fill="#fff" opacity="0.2" />
    <rect x="28" y="28" width="8" height="2" rx="1" fill="#fff" />
  </svg>
);

// 2. Confirmed: Blue clipboard with checklists and a bright green check shield
const ClipboardCheckIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="clipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <rect x="18" y="14" width="28" height="38" rx="4" fill="url(#clipGrad)" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))" />
    <rect x="26" y="10" width="12" height="6" rx="2" fill="#e2e8f0" />
    <path d="M26 26 L38 26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M26 34 L38 34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <circle cx="32" cy="42" r="7" fill="#10b981" />
    <polyline points="29 42 31 44 35 40" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3. Packed: Cardboard box in isometric 3D with yellow tape & labels
const BoxIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    {/* Top Face */}
    <polygon points="32 10, 48 18, 32 26, 16 18" fill="#e6a76c" />
    {/* Left Face */}
    <polygon points="16 18, 32 26, 32 46, 16 38" fill="#cb8d50" />
    {/* Right Face */}
    <polygon points="32 26, 48 18, 48 38, 32 46" fill="#a46f3a" />
    {/* Packing Tape */}
    <polygon points="28 12, 36 16, 28 24, 20 20" fill="#ffd166" opacity="0.8" />
    <polygon points="28 24, 32 26, 32 46, 28 44" fill="#e2b13c" opacity="0.8" />
    <polygon points="32 26, 36 24, 36 44, 32 46" fill="#c79728" opacity="0.8" />
  </svg>
);

// 4. Picked Up: Pickup truck with cargo package in the back bed
const PickupTruckIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="truckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path d="M12 28 L36 28 L40 20 L48 20 L54 28 L54 42 L12 42 Z" fill="url(#truckGrad)" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))" />
    <rect x="36" y="24" width="10" height="8" rx="1" fill="#e2e8f0" />
    <circle cx="20" cy="42" r="6" fill="#1e293b" stroke="#f1f5f9" strokeWidth="2" />
    <circle cx="44" cy="42" r="6" fill="#1e293b" stroke="#f1f5f9" strokeWidth="2" />
    <rect x="14" y="20" width="12" height="8" fill="#cd8d50" rx="1" />
    <line x1="20" y1="20" x2="20" y2="28" stroke="#a46f3a" strokeWidth="1.5" />
  </svg>
);

// 5. Shipping: Pink courier van with windows, wheels and motion speed lines
const ShippingIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="vanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#be185d" />
      </linearGradient>
    </defs>
    <line x1="4" y1="20" x2="12" y2="20" stroke="#fbc531" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="28" x2="10" y2="28" stroke="#fbc531" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6" y1="36" x2="14" y2="36" stroke="#fbc531" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 16 L42 16 L52 26 L52 40 L16 40 Z" fill="url(#vanGrad)" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))" />
    <path d="M42 16 L48 24 L42 24 Z" fill="#e2e8f0" />
    <rect x="22" y="20" width="8" height="6" fill="#e2e8f0" />
    <rect x="32" y="20" width="8" height="6" fill="#e2e8f0" />
    <circle cx="24" cy="40" r="5.5" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.5" />
    <circle cx="44" cy="40" r="5.5" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.5" />
  </svg>
);

// 6. Reached Hub: Green distribution warehouse structure with rollup bays
const WarehouseIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="houseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <polygon points="12 48, 12 24, 32 14, 52 24, 52 48" fill="url(#houseGrad)" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))" />
    <polyline points="10 25 32 14 54 25" fill="none" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="18" y="32" width="10" height="16" fill="#e2e8f0" />
    <line x1="18" y1="36" x2="28" y2="36" stroke="#94a3b8" />
    <line x1="18" y1="40" x2="28" y2="40" stroke="#94a3b8" />
    <line x1="18" y1="44" x2="28" y2="44" stroke="#94a3b8" />
    <rect x="36" y="32" width="10" height="16" fill="#e2e8f0" />
    <line x1="36" y1="36" x2="46" y2="36" stroke="#94a3b8" />
    <line x1="36" y1="40" x2="46" y2="40" stroke="#94a3b8" />
    <line x1="36" y1="44" x2="46" y2="44" stroke="#94a3b8" />
  </svg>
);

// 7. Out for Delivery: Courier scooter with a dark cargo box and exhaust clouds
const OutForDeliveryIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
    </defs>
    <circle cx="8" cy="38" r="3" fill="#cbd5e1" opacity="0.6" />
    <circle cx="4" cy="36" r="2" fill="#cbd5e1" opacity="0.4" />
    <path d="M16 32h20l4-12h4v4h-2l-4 12H16z" fill="url(#scooterGrad)" />
    <rect x="14" y="16" width="10" height="12" rx="1" fill="#1e293b" />
    <rect x="17" y="19" width="4" height="6" fill="#fff" opacity="0.2" />
    <circle cx="18" cy="38" r="5" fill="#1e293b" stroke="#fff" strokeWidth="1" />
    <circle cx="36" cy="38" r="5" fill="#1e293b" stroke="#fff" strokeWidth="1" />
  </svg>
);

// 8. Delivered: Blue door, doorstep, welcome mat and a delivered cardboard parcel
const DoorstepIcon = () => (
  <svg viewBox="0 0 64 64" width="32" height="32">
    <rect x="18" y="10" width="28" height="42" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
    <rect x="22" y="12" width="20" height="40" fill="#3b82f6" />
    <circle cx="26" cy="32" r="2" fill="#f59e0b" />
    <ellipse cx="32" cy="52" rx="14" ry="4" fill="#b45309" />
    <polygon points="32 40, 42 43, 32 46, 22 43" fill="#e6a76c" />
    <polygon points="22 43, 32 46, 32 50, 22 47" fill="#cb8d50" />
    <polygon points="32 46, 42 43, 42 47, 32 50" fill="#a46f3a" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ─── STAGE METADATA ───
const STATUS_STEPS = [
  { 
    status: 'order placed', 
    title: 'Order Placed', 
    desc: 'Order received.', 
    icon: ShoppingBagIcon, 
    percent: 0.0,
    timeEst: '09:30 AM',
    substeps: [
      { text: 'Order details submitted successfully', done: true },
      { text: 'Payment verification complete', done: true }
    ]
  },
  { 
    status: 'order confirmed', 
    title: 'Order Confirmed', 
    desc: 'Order accepted.', 
    icon: ClipboardCheckIcon, 
    percent: 0.14,
    timeEst: '09:45 AM',
    substeps: [
      { text: 'Seller accepted order', done: true },
      { text: 'Invoice generated & sent', done: true }
    ]
  },
  { 
    status: 'order packed', 
    title: 'Order Packed', 
    desc: 'Packed safely.', 
    icon: BoxIcon, 
    percent: 0.28,
    timeEst: '10:15 AM',
    substeps: [
      { text: 'Items inspected & verified', done: true },
      { text: 'Packed in biodegradable packaging', done: true }
    ]
  },
  { 
    status: 'Pickuped', 
    title: 'Picked Up', 
    desc: 'Courier picked up.', 
    icon: PickupTruckIcon, 
    percent: 0.42,
    timeEst: '11:00 AM',
    substeps: [
      { text: 'Courier partner assigned', done: true },
      { text: 'Package retrieved by courier', done: true }
    ]
  },
  { 
    status: 'Shipping', 
    title: 'Shipping', 
    desc: 'In transit.', 
    icon: ShippingIcon, 
    percent: 0.57,
    timeEst: '01:30 PM (Est)',
    substeps: [
      { text: 'Departed origin hub', done: true },
      { text: 'Transit through state distribution hub', done: false }
    ]
  },
  { 
    status: 'Reached', 
    title: 'Reached Hub', 
    desc: 'Arrived at hub.', 
    icon: WarehouseIcon, 
    percent: 0.71,
    timeEst: '04:00 PM (Est)',
    substeps: [
      { text: 'Sorted at local delivery center', done: false },
      { text: 'Assigned to delivery route', done: false }
    ]
  },
  { 
    status: 'Out for delivery', 
    title: 'Out for Delivery', 
    desc: 'Courier nearby.', 
    icon: OutForDeliveryIcon, 
    percent: 0.85,
    timeEst: '05:30 PM (Est)',
    substeps: [
      { text: 'Out with delivery executive', done: false },
      { text: 'OTP code generated for delivery verification', done: false }
    ]
  },
  { 
    status: 'Delivery', 
    title: 'Delivered', 
    desc: 'Package delivered.', 
    icon: DoorstepIcon, 
    percent: 1.0,
    timeEst: '06:00 PM (Est)',
    substeps: [
      { text: 'Signed by recipient', done: false },
      { text: 'Order archived', done: false }
    ]
  }
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredStepIdx, setHoveredStepIdx] = useState(null);

  // Default coordinate placeholders (will be overridden on mount)
  const [stepsWithCoords, setStepsWithCoords] = useState(
    STATUS_STEPS.map(step => ({ ...step, x: 0, y: 0 }))
  );
  
  const pathRef = useRef(null);
  const isCancelled = order?.status === 'cancelled';

  // Responsive layout state listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Winding SVG paths definition
  const desktopPath = "M 100 150 C 180 150, 240 140, 320 140 C 410 140, 440 110, 460 85 C 475 65, 490 50, 500 50";
  const mobilePath = "M 100 40 C 40 110, 160 180, 100 250 C 40 320, 160 390, 100 460 L 100 540";

  const activePathD = isMobile ? mobilePath : desktopPath;
  const viewBoxSize = isMobile ? "0 0 200 600" : "0 0 600 220";
  const vWidth = isMobile ? 200 : 600;
  const vHeight = isMobile ? 600 : 220;

  // 1. Calculate path length and pin coordinates dynamically on mount or resize
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
  }, [isMobile]);

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
  }, [animatedProgress, pathLength, isMobile]);

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
      <div className="tracker-map-wrapper" style={{ position: 'relative' }}>
        
        {/* SVG Path Render */}
        <svg 
          viewBox={viewBoxSize} 
          className={`tracker-svg ${isCancelled ? 'cancelled' : ''}`}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="activePathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* 1. Underlying path: dotted path representing the whole road */}
          <path
            d={activePathD}
            fill="none"
            stroke="var(--border-color, #E2E8F0)"
            strokeWidth="4"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* 2. Active path: solid highlight indicating distance traveled */}
          <path
            ref={pathRef}
            d={activePathD}
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
              <g 
                key={step.status} 
                className={`map-pin ${isStepActive ? 'active' : ''}`} 
                transform={`translate(${step.x}, ${step.y})`}
                onMouseEnter={() => setHoveredStepIdx(idx)}
                onMouseLeave={() => setHoveredStepIdx(null)}
              >
                {/* Pulse glow if currently active or resting */}
                {isStepActive && isCurrentRest && (
                  <circle cx="0" cy="0" r="14" fill={idx === 7 ? '#10b981' : '#4f46e5'} opacity="0.3" className="map-pin-pulse" />
                )}
                <ellipse cx="0" cy="2" rx="7" ry="2" fill="rgba(0,0,0,0.12)" />
                <path 
                  d="M0 -36 C-11 -36 -20 -27 -20 -16 C-20 -4 0 10 0 10 C0 10 20 -4 20 -16 C20 -27 11 -36 0 -36 Z" 
                  fill={isStepActive ? (idx === 7 ? '#10b981' : '#1b4332') : '#cbd5e1'} 
                  className="map-pin-marker"
                  style={{ transition: 'fill 0.3s ease' }}
                />
                <circle cx="0" cy="-17" r="7.5" fill="#FFF" />
                <g transform="translate(-16, -33)" style={{ transformOrigin: 'center' }}>
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
                
                <g fill="#1b4332">
                  <path d="M22 17h-1.5c-.3 0-.5-.2-.5-.5v-4c0-.8-.7-1.5-1.5-1.5H15v-2h2c.6 0 1-.4 1-1s-.4-1-1-1h-4c-.6 0-1 .4-1 1s.4 1 1 1h1v2H9c-.8 0-1.5.7-1.5 1.5v4c0 .3-.2.5-.5.5H5c-.6 0-1 .4-1 1s.4 1 1 1h17c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  <rect x="5" y="7" width="7" height="8" rx="1.5" fill="#fbc531" />
                  <rect x="7.5" y="9.5" width="2" height="3" fill="#FFF" opacity="0.3" />
                  
                  <circle cx="8" cy="20" r="3.5" stroke="#1e293b" strokeWidth="1.5" fill="#FFF" />
                  <circle cx="20" cy="20" r="3.5" stroke="#1e293b" strokeWidth="1.5" fill="#FFF" />
                  <circle cx="8" cy="20" r="1" fill="#1e293b" />
                  <circle cx="20" cy="20" r="1" fill="#1e293b" />
                  
                  <path d="M19.5 9h1c.3 0 .5-.2.5-.5V5.5c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5V8.5c0 .3.2.5.5.5z" fill="#0d9488" opacity="0.75" />
                  <path d="M22.5 7.5l3.5-.5v2z" fill="#fbc531" opacity={isAnimating ? 0.9 : 0.4} />
                </g>
              </g>
            </g>
          )}
        </svg>

        {/* ─── HOVER STATE TOOLTIP CARD ─── */}
        {hoveredStepIdx !== null && (
          <div 
            className={`tracking-tooltip-card ${isMobile ? 'mobile' : 'desktop'}`}
            style={{
              position: 'absolute',
              left: `${(stepsWithCoords[hoveredStepIdx].x / vWidth) * 100}%`,
              top: `${(stepsWithCoords[hoveredStepIdx].y / vHeight) * 100}%`,
              transform: isMobile ? 'translate(20px, -50%)' : 'translate(-50%, -115%)',
              pointerEvents: 'none',
              zIndex: 99
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-title">{STATUS_STEPS[hoveredStepIdx].title}</span>
              <span className="tooltip-badge">{STATUS_STEPS[hoveredStepIdx].timeEst}</span>
            </div>
            <p className="tooltip-desc">{STATUS_STEPS[hoveredStepIdx].desc}</p>
            <div className="tooltip-substeps">
              {STATUS_STEPS[hoveredStepIdx].substeps.map((sub, sidx) => (
                <div key={sidx} className={`tooltip-substep ${sub.done ? 'done' : 'pending'}`}>
                  <span className="substep-bullet">{sub.done ? '✓' : '○'}</span>
                  <span className="substep-text">{sub.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <div className="timeline-step-time">{step.timeEst}</div>
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
