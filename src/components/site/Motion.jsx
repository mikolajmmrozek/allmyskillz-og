import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Image } from '@/components/ui/image';

const EASE = [0.22, 1, 0.36, 1];

// Fade + rise into view on scroll.
export function Reveal({ children, delay = 0, y = 28, className = '', once = true, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

// Stagger a group of children (wrap each child in <Reveal> yourself or use this wrapper).
export function Stagger({ children, className = '', gap = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', y = 28 }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
    >
      {children}
    </motion.div>
  );
}

// Scroll-driven vertical parallax for an image (kept overscaled so edges never show).
export function ParallaxImage({ src, className = '', strength = 6 }) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0 scale-[1.18] will-change-transform">
        <Image src={src} fittingType="fill" className="w-full h-full" />
      </motion.div>
    </div>
  );
}

// Slow Ken-Burns zoom for hero/feature media.
export function KenBurns({ src, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: 'easeOut' }}
      >
        <Image src={src} fittingType="fill" className="w-full h-full" />
      </motion.div>
    </div>
  );
}