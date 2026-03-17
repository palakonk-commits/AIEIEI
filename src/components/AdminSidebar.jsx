import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Users, Settings, Database } from 'lucide-react';
import s from './AdminSidebar.module.css';

export default function AdminSidebar({ isOpen, toggleMenu, currentView, setView }) {
  const menuItems = [
    { id: 'players', label: 'จัดการผู้เล่น', icon: <Users size={20} strokeWidth={1.5} /> },
    { id: 'levels', label: 'จัดการเนื้อหาด่าน', icon: <Database size={20} strokeWidth={1.5} /> },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: <Settings size={20} strokeWidth={1.5} /> }
  ];

  return (
    <>
      <button className={s.hamburger} onClick={toggleMenu}>
        <Menu size={24} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={s.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />
            <motion.aside
              className={s.sidebar}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={s.header}>
                <h2 className={s.sysTitle}>ระบบจัดการส่วนกลาง</h2>
                <button className={s.closeBtn} onClick={toggleMenu}>
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <nav className={s.nav}>
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    className={`${s.navItem} ${currentView === item.id ? s.navItemActive : ''}`}
                    onClick={() => {
                      setView(item.id);
                      toggleMenu();
                    }}
                  >
                    <span className={s.navIcon}>{item.icon}</span>
                    <span className={s.navLabel}>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className={s.footer}>
                <p>เวอร์ชัน 2.0.0 (เสถียร)</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
