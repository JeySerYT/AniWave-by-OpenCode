import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';
import { SkeletonGrid } from '../components/Skeleton';
import Footer from '../components/Footer';
import './Profile.css';

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

const ProfileContent = () => {
  const { user, loading: authLoading, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar: '', banner: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [bannerDragging, setBannerDragging] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const openEdit = () => {
    setEditForm({ username: user?.username || '', avatar: user?.avatar || '', banner: user?.banner || '', bio: user?.bio || '' });
    setShowEdit(true);
  };

  const handleFileSelect = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (макс. 10MB)'); return; }
    try {
      const compressed = await compressImage(file, field === 'avatar' ? 512 : 1024, 0.8);
      setEditForm(prev => ({ ...prev, [field]: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({ ...prev, [field]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, field) => {
    e.preventDefault();
    setBannerDragging(false);
    setAvatarDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (макс. 10MB)'); return; }
    try {
      const compressed = await compressImage(file, field === 'avatar' ? 512 : 1024, 0.8);
      setEditForm(prev => ({ ...prev, [field]: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({ ...prev, [field]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    if (!dataURL || !dataURL.startsWith('data:')) return null;
    const [header, base64] = dataURL.split(',', 2);
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (editForm.username) formData.append('username', editForm.username);
      if (editForm.bio) formData.append('bio', editForm.bio);

      const avatarBlob = dataURLtoBlob(editForm.avatar);
      if (avatarBlob) formData.append('avatar', avatarBlob, 'avatar.jpg');

      const bannerBlob = dataURLtoBlob(editForm.banner);
      if (bannerBlob) formData.append('banner', bannerBlob, 'banner.jpg');

      if (editForm.avatar && !editForm.avatar.startsWith('data:')) formData.append('avatar_url', editForm.avatar);
      if (editForm.banner && !editForm.banner.startsWith('data:')) formData.append('banner_url', editForm.banner);

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (res.ok) {
        await refresh();
        setShowEdit(false);
      } else {
        const data = await res.json();
        alert(data.detail || 'Ошибка сохранения');
      }
    } catch { alert('Ошибка сети'); }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <SkeletonGrid count={6} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="guest-profile">
          <motion.div
            className="guest-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Войдите, чтобы продолжить</h1>
            <p>Для доступа к профилю необходимо войти в аккаунт или зарегистрироваться</p>
            <div className="guest-actions">
              <motion.button className="guest-btn primary" onClick={() => navigate('/login')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Войти
              </motion.button>
              <motion.button className="guest-btn secondary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Регистрация
              </motion.button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        <motion.div className="profile-header default-banner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} />

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} loading="lazy" />
            ) : (
              <div className="avatar-initials">{user.username?.[0]?.toUpperCase() || '?'}</div>
            )}
          </div>
          <div className="online-status">
            <span className="status-dot" />
            <span className="status-text">Online</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{user.favorites_count || 0}</span>
              <span className="stat-label">В коллекциях</span>
            </div>
          </div>

          <div className="profile-actions">
            <motion.button
              className="edit-profile-btn"
              onClick={openEdit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Редактировать профиль</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showEdit && (
            <div className="edit-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}>
              <motion.div className="edit-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                <h2>Редактировать профиль</h2>

                <div className="edit-field">
                  <label>Имя пользователя</label>
                  <input type="text" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} placeholder="Ваше имя" />
                </div>

                <div className="edit-field">
                  <label>Аватар</label>
                  <div
                    className={`drop-zone drop-zone-small ${avatarDragging ? 'dragging' : ''}`}
                    onClick={() => avatarInputRef.current?.click()}
                    onDragOver={(e) => { handleDragOver(e); setAvatarDragging(true); }}
                    onDragLeave={() => setAvatarDragging(false)}
                    onDrop={(e) => handleDrop(e, 'avatar')}
                  >
                    {editForm.avatar ? (
                      <img src={editForm.avatar} alt="" className="drop-preview-avatar" loading="lazy" />
                    ) : user?.avatar ? (
                      <img src={user.avatar} alt="" className="drop-preview-avatar" loading="lazy" />
                    ) : (
                      <div className="drop-placeholder">
                        <Upload size={20} />
                        <span>GIF, PNG, JPG</span>
                      </div>
                    )}
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/gif,image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => handleFileSelect(e, 'avatar')} />
                  <input type="text" value={editForm.avatar.startsWith('data:') ? '' : editForm.avatar} onChange={e => setEditForm(f => ({ ...f, avatar: e.target.value }))} placeholder="Или вставьте URL аватара" style={{ marginTop: '0.5rem' }} />
                </div>

                <div className="edit-field">
                  <label>Баннер</label>
                  <div
                    className={`drop-zone ${bannerDragging ? 'dragging' : ''}`}
                    onClick={() => bannerInputRef.current?.click()}
                    onDragOver={(e) => { handleDragOver(e); setBannerDragging(true); }}
                    onDragLeave={() => setBannerDragging(false)}
                    onDrop={(e) => handleDrop(e, 'banner')}
                  >
                    {editForm.banner ? (
                      <img src={editForm.banner} alt="" loading="lazy" style={{ maxHeight: '80px', borderRadius: '8px' }} />
                    ) : user?.banner ? (
                      <img src={user.banner} alt="" loading="lazy" style={{ maxHeight: '80px', borderRadius: '8px' }} />
                    ) : (
                      <div className="drop-placeholder">
                        <Upload size={24} />
                        <span>Перетащите или нажмите для загрузки GIF, PNG, JPG</span>
                      </div>
                    )}
                  </div>
                  <input ref={bannerInputRef} type="file" accept="image/gif,image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => handleFileSelect(e, 'banner')} />
                  <input type="text" value={editForm.banner.startsWith('data:') ? '' : editForm.banner} onChange={e => setEditForm(f => ({ ...f, banner: e.target.value }))} placeholder="Или вставьте URL баннера" style={{ marginTop: '0.5rem' }} />
                </div>

                <div className="edit-field">
                  <label>О себе</label>
                  <textarea rows="3" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Расскажите о себе" />
                </div>

                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => setShowEdit(false)}>Отмена</button>
                  <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

const Profile = () => <ProfileContent />;

export default Profile;
