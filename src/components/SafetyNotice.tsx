import { MapPin } from 'lucide-react';

interface SafetyNoticeProps {
  variant?: 'default' | 'compact';
}

export function SafetyNotice({ variant = 'default' }: SafetyNoticeProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-green-800">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <p>Meet on campus for safe exchange</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 text-sm mb-1">
            Meet on Campus for Safe Exchange
          </h3>
          <p className="text-sm text-green-800">
            Arrange to meet in public campus locations during daytime. Inspect the item before completing the transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
