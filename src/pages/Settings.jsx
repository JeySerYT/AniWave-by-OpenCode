import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Monitor,
  Info,
  Save,
  LogOut,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Github,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import Footer from '../components/Footer';
import './Settings.css';

const MAX_IMAGE_SIZE = 1024;

const compressImage = (file, maxSize = MAX_IMAGE_SIZE, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsDataURL(blob);
          } else {
            resolve(e.target.result);
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const TABS = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'account', label: 'Аккаунт', icon: Shield },
  { id: 'appearance', label: 'Внешний вид', icon: Monitor },
  { id: 'about', label: 'О системе', icon: Info },
];

const SettingsPage = () => {
  const { user, loading: authLoading, refresh, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({ username: '', bio: '', avatar: '', banner: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  useEffect(() => {
    if (user && !initialized) {
      setForm({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        banner: user.banner || '',
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    try {
      const compressed = await compressImage(file, 512, 0.8);
      setForm(prev => ({ ...prev, avatar: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, avatar: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    try {
      const compressed = await compressImage(file, 1024, 0.8);
      setForm(prev => ({ ...prev, banner: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, banner: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body = {};
      if (form.username) body.username = form.username;
      if (form.bio) body.bio = form.bio;
      if (form.avatar) body.avatar = form.avatar;
      if (form.banner) body.banner = form.banner;

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await refresh();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        alert(data.detail || 'Ошибка сохранения');
      }
    } catch {
      alert('Ошибка сети');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPass.length < 8) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.newPass,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Ошибка смены пароля');
      }
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      alert('Пароль успешно изменён');
    } catch (err) {
      if (err.message.includes('Not Found') || err.message.includes('404')) {
        setPasswordError('Функция смены пароля пока не доступна на сервере');
      } else {
        setPasswordError(err.message);
      }
    }
    setChangingPassword(false);
  };

  if (authLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-loader" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-guest">
          <motion.div
            className="settings-guest-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Shield size={48} className="settings-guest-icon" />
            <h1>Войдите, чтобы продолжить</h1>
            <p>Для доступа к настройкам необходимо войти в аккаунт</p>
            <div className="settings-guest-actions">
              <motion.button
                className="settings-guest-btn primary"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Войти
              </motion.button>
              <motion.button
                className="settings-guest-btn secondary"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Регистрация
              </motion.button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const providerLabel = {
    email: 'Email и пароль',
    google: 'Google',
    github: 'GitHub',
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">Редактировать профиль</h2>
      <p className="settings-section-desc">Настройте ваше имя, аватар и информацию о себе</p>

      <div className="settings-profile-preview">
        <div className="settings-avatar-section">
          <div className="settings-avatar">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" loading="lazy" width="80" height="80" />
            ) : (
              <div className="settings-avatar-initials">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <label className="settings-file-btn">
            <Upload size={14} />
            <span>Загрузить аватар</span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
        </div>
      </div>

      <div className="settings-field">
        <label htmlFor="settings-username">Имя пользователя</label>
        <input
          id="settings-username"
          type="text"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          placeholder="Ваше имя"
          minLength={3}
          maxLength={50}
        />
      </div>

      <div className="settings-field">
        <label htmlFor="settings-bio">О себе</label>
        <textarea
          id="settings-bio"
          rows={3}
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Расскажите о себе"
          maxLength={500}
        />
      </div>

      <div className="settings-field">
        <label htmlFor="settings-banner">Баннер профиля (URL)</label>
        <div className="settings-banner-upload">
          <input
            id="settings-banner"
            type="text"
            value={form.banner.startsWith('data:') ? '' : form.banner}
            onChange={e => setForm(f => ({ ...f, banner: e.target.value }))}
            placeholder="https://example.com/banner.jpg"
          />
          <label className="settings-file-btn secondary">
            <Upload size={14} />
            <span>Файл</span>
            <input type="file" accept="image/*" onChange={handleBannerChange} hidden />
          </label>
        </div>
        {form.banner && (
          <img src={form.banner} alt="Banner preview" loading="lazy" width="400" height="100" className="settings-banner-preview" />
        )}
      </div>

      <div className="settings-actions">
        <motion.button
          className="settings-save-btn"
          onClick={saveProfile}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? (
            'Сохранение...'
          ) : saved ? (
            <>
              <Check size={16} />
              <span>Сохранено</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Сохранить</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">Данные аккаунта</h2>
      <p className="settings-section-desc">Информация о вашей учётной записи</p>

      <div className="settings-info-grid">
        <div className="settings-info-card">
          <span className="settings-info-label">Email</span>
          <span className="settings-info-value">{user.email}</span>
        </div>
        <div className="settings-info-card">
          <span className="settings-info-label">Способ входа</span>
          <span className="settings-info-value">
            {providerLabel[user.provider] || user.provider}
          </span>
        </div>
        <div className="settings-info-card">
          <span className="settings-info-label">Дата регистрации</span>
          <span className="settings-info-value">
            {new Date(user.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="settings-info-card">
          <span className="settings-info-label">ID пользователя</span>
          <span className="settings-info-value mono">{user.id?.slice(0, 8)}...</span>
        </div>
      </div>

      {user.provider === 'email' && (
        <div className="settings-password-section">
          <h3 className="settings-subsection-title">Смена пароля</h3>
          <form onSubmit={handlePasswordChange} className="settings-password-form">
            <div className="settings-field">
              <label htmlFor="settings-current-pass">Текущий пароль</label>
              <div className="settings-password-input">
                <input
                  id="settings-current-pass"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Введите текущий пароль"
                  required
                />
                <button
                  type="button"
                  className="settings-toggle-pass"
                  onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                  tabIndex={-1}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="settings-new-pass">Новый пароль</label>
              <div className="settings-password-input">
                <input
                  id="settings-new-pass"
                  type={showPasswords.newPass ? 'text' : 'password'}
                  value={passwordForm.newPass}
                  onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="settings-toggle-pass"
                  onClick={() => setShowPasswords(s => ({ ...s, newPass: !s.newPass }))}
                  tabIndex={-1}
                >
                  {showPasswords.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="settings-confirm-pass">Подтвердите пароль</label>
              <div className="settings-password-input">
                <input
                  id="settings-confirm-pass"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Повторите новый пароль"
                  required
                />
                <button
                  type="button"
                  className="settings-toggle-pass"
                  onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                  tabIndex={-1}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="settings-password-error">
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            <motion.button
              type="submit"
              className="settings-save-btn"
              disabled={changingPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {changingPassword ? 'Смена...' : 'Изменить пароль'}
            </motion.button>
          </form>
        </div>
      )}

      <div className="settings-danger-zone">
        <h3 className="settings-subsection-title danger">Опасная зона</h3>
        <p className="settings-danger-desc">
          После удаления аккаунта все ваши данные будут безвозвратно удалены. Это действие нельзя отменить.
        </p>
        {!showDeleteConfirm ? (
          <motion.button
            className="settings-danger-btn"
            onClick={() => setShowDeleteConfirm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            <span>Удалить аккаунт</span>
          </motion.button>
        ) : (
          <div className="settings-delete-confirm">
            <p className="settings-delete-warning">
              Введите <strong>УДАЛИТЬ</strong> для подтверждения
            </p>
            <div className="settings-delete-input-row">
              <input
                type="text"
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                placeholder="УДАЛИТЬ"
                className="settings-delete-input"
              />
              <button
                className="settings-danger-btn"
                disabled={deleteText !== 'УДАЛИТЬ'}
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/auth/delete-account`, {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    if (res.ok) {
                      await logout();
                    } else {
                      const data = await res.json();
                      if (data.detail?.includes('Not Found') || res.status === 404) {
                        setShowDeleteConfirm(false);
                        setDeleteText('');
                        alert('Функция удаления аккаунта пока не доступна на сервере');
                      } else {
                        alert(data.detail || 'Ошибка удаления');
                      }
                    }
                  } catch {
                    setShowDeleteConfirm(false);
                    setDeleteText('');
                    alert('Функция удаления аккаунта пока не доступна на сервере');
                  }
                }}
              >
                <Trash2 size={16} />
                <span>Удалить</span>
              </button>
              <button
                className="settings-cancel-btn"
                onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">Внешний вид</h2>
      <p className="settings-section-desc">Настройки отображения интерфейса</p>

      <div className="settings-appearance-card">
        <div className="settings-appearance-row">
          <div className="settings-appearance-info">
            <span className="settings-appearance-label">Тёмная тема</span>
            <span className="settings-appearance-desc">Тёмная тема включена по умолчанию</span>
          </div>
          <div className="settings-toggle checked">
            <div className="settings-toggle-knob" />
          </div>
        </div>

        <div className="settings-appearance-row">
          <div className="settings-appearance-info">
            <span className="settings-appearance-label">Акцентный цвет</span>
            <span className="settings-appearance-desc">Красный / Розовый градиент</span>
          </div>
          <div className="settings-color-swatches">
            <div className="settings-swatch active" style={{ background: 'linear-gradient(135deg, #E53935, #FF4081)' }} />
            <div className="settings-swatch" style={{ background: '#6366f1' }} title="Indigo" />
            <div className="settings-swatch" style={{ background: '#22c55e' }} title="Green" />
            <div className="settings-swatch" style={{ background: '#f59e0b' }} title="Amber" />
          </div>
        </div>
      </div>

      <div className="settings-note">
        <p>Настройка акцентных цветов находится в разработке. Скоро вы сможете выбрать свой стиль оформления.</p>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">О системе</h2>
      <p className="settings-section-desc">Информация о сервисе AniWave</p>

      <div className="settings-about-card">
        <div className="settings-about-header">
          <div className="settings-about-logo">
            <Heart size={28} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div>
            <h3 className="settings-about-name">AniWave</h3>
            <span className="settings-about-version">Версия 1.0.0</span>
          </div>
        </div>

        <div className="settings-about-details">
          <div className="settings-about-row">
            <span>Фреймворк</span>
            <span>React 18 + Vite 5</span>
          </div>
          <div className="settings-about-row">
            <span>API</span>
            <span>AniLibria (anilibria.top)</span>
          </div>
          <div className="settings-about-row">
            <span>Бэкенд</span>
            <span>FastAPI + PostgreSQL</span>
          </div>
          <div className="settings-about-row">
            <span>Видео</span>
            <span>HLS.js</span>
          </div>
          <div className="settings-about-row">
            <span>Анимации</span>
            <span>Framer Motion</span>
          </div>
        </div>

        <div className="settings-about-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="settings-about-link">
            <Github size={16} />
            <span>GitHub</span>
            <ExternalLink size={12} />
          </a>
          <a href="/faq" className="settings-about-link">
            <span>FAQ</span>
            <ExternalLink size={12} />
          </a>
          <a href="/terms" className="settings-about-link">
            <span>Условия использования</span>
            <ExternalLink size={12} />
          </a>
          <a href="/privacy" className="settings-about-link">
            <span>Политика конфиденциальности</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="settings-about-footer-text">
        <p>AniWave — сервис для поиска и просмотра аниме. Данные предоставлены AniLibria.</p>
        <p>Сделано с любовью к аниме</p>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-layout">
        <nav className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h1 className="settings-title">Настройки</h1>
          </div>
          <ul className="settings-tabs">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <motion.button
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </motion.button>
              </li>
            ))}
          </ul>

          <div className="settings-sidebar-footer">
            <motion.button
              className="settings-logout-btn"
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={16} />
              <span>Выйти</span>
            </motion.button>
          </div>
        </nav>

        <main className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'account' && renderAccountTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'about' && renderAboutTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
