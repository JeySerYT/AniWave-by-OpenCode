import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import './Settings.css';

const SettingsPage = () => {
  return (
    <div className="settings-page">
      <motion.div
        className="settings-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="settings-icon-wrap">
          <SettingsIcon size={48} className="settings-icon" />
        </div>
        <h1 className="settings-title">Настройки</h1>
        <p className="settings-subtitle">Раздел находится в разработке</p>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
