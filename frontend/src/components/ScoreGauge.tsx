import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let strokeColor = '#059669';
  let textColor = 'text-emerald-600';
  let ratingLabel = 'Strong fit';

  if (clampedScore < 60) {
    strokeColor = '#dc2626';
    textColor = 'text-red-600';
    ratingLabel = 'Low match';
  } else if (clampedScore < 80) {
    strokeColor = '#d97706';
    textColor = 'text-amber-600';
    ratingLabel = 'Moderate';
  }

  const dimensions = {
    sm: { width: 40, radius: 15, stroke: 3, fontSize: 'text-[11px]', labelSize: 'text-[10px]' },
    md: { width: 72, radius: 28, stroke: 5, fontSize: 'text-lg', labelSize: 'text-xs' },
    lg: { width: 110, radius: 44, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-sm' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}>
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke="#e5e7eb"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold ${dimensions.fontSize} ${textColor}`}>
            {clampedScore}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`mt-1 font-medium ${dimensions.labelSize} text-gray-500`}>
          {ratingLabel}
        </span>
      )}
    </div>
  );
};
