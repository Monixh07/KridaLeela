import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-10 px-4 rounded-xl border border-dashed border-[#D8CCC0] dark:border-[#3A322B] bg-[#FAF7F2]/60 dark:bg-[#1E1916]/40 flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F0E8DD] dark:bg-[#2A241F] text-[#B43B22] flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#28211A] dark:text-[#F0EAE1]">
        {title}
      </h3>
      <p className="mt-1 text-xs text-[#746659] dark:text-[#B3A596] max-w-sm">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
