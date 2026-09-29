import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#28211A] dark:text-[#F0EAE1]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[#746659] dark:text-[#B3A596]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
