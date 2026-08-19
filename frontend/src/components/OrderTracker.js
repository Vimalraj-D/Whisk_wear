import React, { useState, useEffect, useCallback } from 'react';
import './OrderTracker.css';
import {
  ShoppingCart,
  ClipboardCheck,
  Package,
  Truck,
  Send,
  Warehouse,
  Bike,
  Home,
  AlertCircle,
  Check
} from 'lucide-react';

const STATUS_STEPS = [
  { status: 'order placed', title: 'Order Placed', icon: ShoppingCart },
  { status: 'order confirmed', title: 'Confirmed', icon: ClipboardCheck },
  { status: 'order packed', title: 'Packed', icon: Package },
  { status: 'Pickuped', title: 'Picked Up', icon: Truck },
  { status: 'Shipping', title: 'Shipping', icon: Send },
  { status: 'Reached', title: 'Reached Hub', icon: Warehouse },
  { status: 'Out for delivery', title: 'Out for Delivery', icon: Bike },
  { status: 'Delivery', title: 'Delivered', icon: Home }
];

const STEP_OFFSETS_HOURS = [0, 0.25, 0.75, 1.5, 4, 6.5, 8, 9];

const formatDateParts = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return { date: `${month} ${day}, ${year}`, time: `${hours}:${mins} ${ampm}` };
};

const normalizeStatus = (status) => {
  if (!status) return 'order placed';
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'paid') return 'order placed';
  if (s === 'shipped') return 'Shipping';
  if (s === 'delivered') return 'Delivery';
  return status;
};

const getStepTimestamps = (createdAt) => {
  const base = new Date(createdAt).getTime();
  const now = Date.now();
  return STEP_OFFSETS_HOURS.map(hrs => {
    const ts = base + hrs * 3600000;
    return new Date(Math.min(ts, now));
  });
};

export default function OrderTracker({ order }) {
  const [currentStatus, setCurrentStatus] = useState(normalizeStatus(order?.status));
  const [animatedProgress, setAnimatedProgress] = useState(-1);

  const isCancelled = order?.status === 'cancelled';

  const currentStepIdx = STATUS_STEPS.findIndex(
    s => s.status.toLowerCase() === currentStatus.toLowerCase()
  );

  const stepTimestamps = order?.created_at ? getStepTimestamps(order.created_at) : [];

  const getTarget = useCallback(() => {
    if (isCancelled) return -1;
    return currentStepIdx >= 0 ? currentStepIdx : -1;
  }, [currentStepIdx, isCancelled]);

  useEffect(() => {
    const target = getTarget();
    const start = animatedProgress;
    const diff = target - start;
    if (Math.abs(diff) < 0.01) return;

    let rafId;
    let startTs = null;
    const duration = 350;

    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(start + diff * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, 80);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [currentStatus, isCancelled, getTarget]);

  useEffect(() => {
    if (order?.status) setCurrentStatus(normalizeStatus(order.status));
  }, [order?.status]);

  const getTitle = () => {
    if (isCancelled) return 'Order Cancelled';
    const step = STATUS_STEPS.find(s => s.status.toLowerCase() === currentStatus.toLowerCase());
    return step?.title || 'Order Processing';
  };

  const getStepState = (idx) => {
    if (isCancelled) return 'future';
    if (idx < currentStepIdx) return 'completed';
    if (idx === currentStepIdx) return 'current';
    return 'future';
  };

  const renderDesktopNode = (step, idx) => {
    const Icon = step.icon;
    const pct = idx / (STATUS_STEPS.length - 1);
    const state = getStepState(idx);
    const showTime = (state === 'completed' || state === 'current') && stepTimestamps[idx];
    const ts = showTime ? formatDateParts(stepTimestamps[idx]) : null;

    return (
      <div
        key={step.status}
        className={`ot-step ${state}`}
        style={{ left: `calc(${pct * 100}% - ${pct * 90}px)` }}
      >
        <div className="ot-node">
          {state === 'current' && <div className="ot-node-pulse" />}
          <div className="ot-node-inner">
            {state === 'completed' ? (
              <Check size={20} strokeWidth={3} />
            ) : (
              <Icon size={20} strokeWidth={2.2} />
            )}
          </div>
        </div>
        <div className="ot-label">{step.title}</div>
        <div className="ot-time">
          {ts ? (
            <>
              <span>{ts.date}</span>
              <span>{ts.time}</span>
            </>
          ) : (
            '\u00A0'
          )}
        </div>
      </div>
    );
  };

  const renderMobileNode = (step, idx) => {
    const Icon = step.icon;
    const state = getStepState(idx);
    const showTime = (state === 'completed' || state === 'current') && stepTimestamps[idx];
    const ts = showTime ? formatDateParts(stepTimestamps[idx]) : null;

    return (
      <div
        key={step.status}
        className={`ot-mvstep ${state}`}
      >
        {idx > 0 && (
          <div className={`ot-mvline ${state === 'completed' || state === 'current' ? 'active' : ''}`} />
        )}

        <div className="ot-mvrow">
          <div className="ot-mvnode">
            {state === 'current' && <div className="ot-mvnode-pulse" />}
            <div className="ot-mvnode-inner">
              {state === 'completed' ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <Icon size={16} strokeWidth={2.2} />
              )}
            </div>
          </div>

          <div className="ot-mvinfo">
            <div className="ot-mvlabel">{step.title}</div>
            {ts && (
              <div className="ot-mvtime">
                <span>{ts.date}</span>
                <span>{ts.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ot-container">
      <div className="ot-header">
        <div>
          <h4 className="ot-title">
            {getTitle()}
            <span className="ot-order-id">#{order?.id}</span>
          </h4>
          <p className="ot-date">
            Placed on {new Date(order?.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
        <span className={`ot-status-badge status-${order?.status || 'pending'}`}>
          {order?.status || 'pending'}
        </span>
      </div>

      {isCancelled && (
        <div className="ot-cancelled">
          <AlertCircle size={18} />
          <span>This order was cancelled. Refund initiated if paid online.</span>
        </div>
      )}

      <div className={`ot-timeline-desktop ${isCancelled ? 'cancelled' : ''}`}>
        <div className="ot-track" />
        <div
          className="ot-track-active"
          style={{
            width: currentStepIdx < 0
              ? '0%'
              : `calc(${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}% - ${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}px)`
          }}
        />
        {STATUS_STEPS.map((step, idx) => renderDesktopNode(step, idx))}
      </div>

      <div className={`ot-timeline-mobile ${isCancelled ? 'cancelled' : ''}`}>
        {STATUS_STEPS.map((step, idx) => renderMobileNode(step, idx))}
      </div>

      <div className="ot-details">
        <div className="ot-details-grid">
          <div>
            <strong>Deliver To:</strong>
            <div className="ot-details-name">{order?.customer_name}</div>
            <div className="ot-details-addr">{order?.customer_address}</div>
          </div>
          <div className="ot-details-right">
            <strong>Payment:</strong>
            <div className="ot-details-name">COD / Online</div>
            <div className="ot-details-addr">Total: ₹{parseFloat(order?.total_amount).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
