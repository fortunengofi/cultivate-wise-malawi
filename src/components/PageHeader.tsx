import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  image?: string;
  overlay?: boolean;
  compact?: boolean;
}

const PageHeader = ({ title, subtitle, children, image, overlay = true, compact = false }: PageHeaderProps) => {
  if (image) {
    return (
      <div className={`relative ${compact ? "h-40" : "h-52 sm:h-64"} overflow-hidden sm:rounded-2xl sm:mx-0 sm:mt-4`}>
        <img src={image} alt="" className="w-full h-full object-cover" />
        {overlay && <div className="absolute inset-0 gradient-hero" />}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-primary-foreground leading-tight"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary-foreground/80 text-sm sm:text-base mt-1 font-medium"
            >
              {subtitle}
            </motion.p>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-earth px-5 sm:px-8 pt-8 pb-6 sm:rounded-2xl sm:mx-0 sm:mt-4">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-primary-foreground leading-tight"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-primary-foreground/80 text-sm sm:text-base mt-1 font-medium"
        >
          {subtitle}
        </motion.p>
      )}
      {children}
    </div>
  );
};

export default PageHeader;
