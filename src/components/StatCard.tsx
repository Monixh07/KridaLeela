import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
}) => {
  return (
    <div className="bg-[#FAF7F2] dark:bg-[#201B17] rounded-xl border border-[#E6DCD1] dark:border-[#38302A] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#746659] dark:text-[#B3A596]">
        <span className="text-xs font-medium tracking-wide">{label}</span>
        {icon && <span className="opacity-75">{icon}</span>}
      </div>
      <div className="mt-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#28211A] dark:text-[#F0EAE1] tabular-nums">
          {value}
        </span>
        {subtext && (
          <p className="mt-0.5 text-xs text-[#746659] dark:text-[#B3A596]">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
