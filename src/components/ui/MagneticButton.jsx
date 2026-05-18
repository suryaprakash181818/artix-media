import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MagneticButton = ({ children, className = "", ...props }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isTouchDevice = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: none)').matches
      : false
  );

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={isTouchDevice.current ? undefined : handleMouse}
      onMouseLeave={isTouchDevice.current ? undefined : reset}
      initial={{ x: 0, y: 0 }}
      animate={{ x, y }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: isTouchDevice.current ? 0.97 : 0.95 }}
      transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.1 }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;
