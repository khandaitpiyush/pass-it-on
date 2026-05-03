import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldOff, X } from 'lucide-react';

type Risk     = 'warn' | 'block';
type Category = 'payment' | 'off_platform' | 'urgency' | 'price_change';

interface ScanResult {
  risk:     Risk;
  category: Category | null;
  reason:   string | null;
}

// ── Copy map ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  payment:      '💳 Payment Risk',
  off_platform: '📲 Off-Platform Request',
  urgency:      '⚡ Pressure Tactics',
  price_change: '💰 Price Manipulation',
};

const DEFAULT_TIPS: Record<Risk, string> = {
  warn:  'Always pay in person on campus. Never transfer money in advance.',
  block: 'This message was blocked. Report this user if the behaviour continues.',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  scan:      ScanResult | null;
  onDismiss: () => void;
}

export const ScamBanner = ({ scan, onDismiss }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!scan);
  }, [scan]);

  if (!visible || !scan) return null;

  const isBlock = scan.risk === 'block';
  const label   = scan.category ? CATEGORY_LABELS[scan.category] : 'Suspicious Activity';
  const tip     = DEFAULT_TIPS[scan.risk];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm
        transition-all duration-200
        ${isBlock
          ? 'border-red-300   bg-red-50   text-red-800'
          : 'border-amber-300 bg-amber-50 text-amber-800'}
      `}
    >
      {/* Icon */}
      <span className="mt-0.5 shrink-0">
        {isBlock
          ? <ShieldOff className="h-5 w-5 text-red-500"    aria-hidden />
          : <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />}
      </span>

      {/* Body */}
      <div className="flex-1 space-y-0.5">
        <p className="font-semibold">{label}</p>
        {scan.reason && <p>{scan.reason}</p>}
        <p className="text-xs opacity-75">{tip}</p>
      </div>

      {/* Dismiss — only for warnings; blocks are permanent */}
      {!isBlock && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss warning"
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};