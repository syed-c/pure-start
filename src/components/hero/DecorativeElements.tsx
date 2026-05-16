interface FloatingShapeProps {
  className?: string;
  delay?: number;
}

export const FloatingDot = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute rounded-full ${className}`}
  />
);

export const FloatingCircle = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute rounded-full border ${className}`}
  />
);

export const FloatingCross = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute font-bold select-none ${className}`}
  >
    +
  </div>
);

export const GradientOrb = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute rounded-full blur-3xl ${className}`}
  />
);

export const ToothIcon = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute ${className}`}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
      <path fill="currentColor" d="M50 10c-15 0-28 8-28 25 0 12 5 20 8 35 2 10 5 20 10 20s8-5 10-15c2 10 5 15 10 15s8-10 10-20c3-15 8-23 8-35 0-17-13-25-28-25z"/>
    </svg>
  </div>
);

export const SparkleIcon = ({ className = "", delay = 0 }: FloatingShapeProps) => (
  <div
    className={`absolute ${className}`}
  >
    <svg viewBox="0 0 24 24" className="w-full h-full text-gold fill-gold">
      <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" />
    </svg>
  </div>
);
