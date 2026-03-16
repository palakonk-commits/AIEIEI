import { motion } from 'framer-motion';
import s from './ShoeHero.module.css';

export default function ShoeHero() {
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <section className={s.hero}>
      <div className={s.container}>
        <motion.div 
          className={s.textContent}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={textVariants} className={s.badge}>
            New Release
          </motion.span>
          <motion.h1 variants={textVariants} className={s.title}>
            <span>Step Into</span>
            <span className={s.titleHighlight}>The Future</span>
          </motion.h1>
          <motion.p variants={textVariants} className={s.desc}>
            Experience unparalleled comfort and bold aesthetics. Designed for those who disrupt the norm and define tomorrow.
          </motion.p>
          <motion.button 
            variants={textVariants} 
            className={s.cta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Collection
          </motion.button>
        </motion.div>

        <motion.div 
          className={s.imageContent}
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        >
          <div className={s.glowCircle}></div>
          <motion.img 
            // Using a placeholder shoe image with transparent background logic
            src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3"
            alt="Futuristic Sneaker" 
            className={s.shoeImg}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}