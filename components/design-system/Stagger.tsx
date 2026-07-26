'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } },
};

/** Wraps a list/grid so its direct StaggerItem children animate in one after another instead of popping in at once. */
export function StaggerList({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="show" {...props}>
      {children}
    </motion.div>
  );
}

/** A single entry inside a StaggerList. */
export function StaggerItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div className={className} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
