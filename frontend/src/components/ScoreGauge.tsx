import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let strokeColor = '#10b981'; // Emerald >= 80
  let textColor = 'text-emerald-400';
  let ratingLabel = 'Excellent Fit';

  if (clampedScore < 60) {
    strokeColor = '#f43f5e'; // Rose < 60
    textColor = 'text-rose-400';
    ratingLabel = 'Low Alignment';
  } else if (clampedScore < 80) {
    strokeColor = '#f59e0b'; // Amber 60-79
    textColor = 'text-amber-400';
    ratingLabel = 'Moderate Fit';
  }

  const dimensions = {
    sm: { width: 48, radius: 18, stroke: 3.5, fontSize: 'text-xs', labelSize: 'text-[10px]' },
    md: { width: 84, radius: 34, stroke: 6, fontSize: 'text-xl', labelSize: 'text-xs' },
    lg: { width: 130, radius: 52, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-sm' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}>
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke="#1e293b"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${dimensions.fontSize} ${textColor} tracking-tight`}>
            {clampedScore}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`mt-1.5 font-medium ${dimensions.labelSize} ${textColor}`}>
          {ratingLabel}
        </span>
      )}
    </div>
  );
};
