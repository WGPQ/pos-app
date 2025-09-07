import React from "react";

interface ComponentCardProps {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  header,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="px-6 py-3">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {header}
        </h3>
      </div>

      <div className="p-2 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
