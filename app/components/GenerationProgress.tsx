import { useEffect, useState } from "react";

// Add this component for the animated percentage counter
export const GenerationProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we reach higher percentages to create a realistic effect
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 1.5;
        if (prev < 85) return prev + 0.8;
        if (prev < 95) return prev + 0.3;
        if (prev < 99) return prev + 0.1;
        return 99; // Never quite reaches 100% until actually done
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Processing</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
