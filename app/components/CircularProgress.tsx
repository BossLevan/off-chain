import React, { useEffect, useState } from "react";

type Props = {
  value: number; // current netCost
  max: number; // typically 5
};

const CircularProgress: React.FC<Props> = ({ value, max }) => {
  const isMobile = useIsMobile();
  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();

      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isMobile;
  }

  const radius = isMobile ? 24 : 30;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  // Linear scale instead of logarithmic for small values
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg height={radius * 2} width={radius * 2} className="block">
      {/* Base circle */}
      <circle
        stroke="#303030"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
      />

      {/* Main progress circle with glossy gradient */}
      <circle
        stroke="url(#glossyGradient)"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
        className="transition-all duration-300"
      />

      {/* Highlight overlay circle - smaller width, partially transparent */}
      <circle
        stroke="url(#highlightGradient)"
        fill="transparent"
        strokeWidth={stroke * 0.6}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
        className="transition-all duration-300"
        style={{ mixBlendMode: "soft-light" }}
      />

      <defs>
        {/* Main glossy gradient */}
        <linearGradient id="glossyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#99CDFF" />{" "}
          {/* Lighter yellow for shine */}
          <stop offset="50%" stopColor="#99CDFF" /> {/* Original yellow */}
          <stop offset="100%" stopColor="#99CDFF" />{" "}
          {/* Darker yellow for depth */}
        </linearGradient>

        {/* Highlight gradient for the glossy effect */}
        <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>

        {/* Add a subtle filter for extra shine */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

export default CircularProgress;
