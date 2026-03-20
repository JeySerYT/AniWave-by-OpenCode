import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <motion.div 
        className="privacy-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="privacy-title">Политика конфиденциальности</h1>
        <p className="privacy-date">Последнее обновление: Март 2026</p>
        
        <div className="privacy-section">
          <h2>1. Сбор данных</h2>
          <p>
            AniWave не собирает персональные данные пользователей. 
            Мы не храним cookies, не отслеживаем активность и не передаём данные третьим лицам.
          </p>
        </div>

        <div className="privacy-section">
          <h2>2. Локальное хранение</h2>
          <p>
            Данные вашего профиля (аватар, баннер, имя, описание) сохраняются 
            исключительно в localStorage вашего браузера. Эти данные доступны 
            только вам и не передаются на наши серверы.
          </p>
        </div>

        <div className="privacy-section">
          <h2>3. Сторонние сервисы</h2>
          <p>
            Мы используем AniList API для получения информации об аниме. 
            При использовании API ваш IP-адрес может передаваться сервису AniList. 
            Пожалуйста, ознакомьтесь с политикой конфиденциальности AniList.
          </p>
        </div>

        <div className="privacy-section">
          <h2>4. Cookies</h2>
          <p>
            AniWave не использует cookies. Мы не сохраняем никаких данных на вашем 
            устройстве, за исключением данных вашего профиля в localStorage.
          </p>
        </div>

        <div className="privacy-section">
          <h2>5. Безопасность</h2>
          <p>
            Мы прилагаем усилия для защиты вашего опыта использования. 
            Однако, поскольку мы не храним ваши данные, риск их утечки отсутствует.
          </p>
        </div>

        <div className="privacy-section">
          <h2>6. Права пользователей</h2>
          <p>
            Вы имеете полный контроль над своими данными в localStorage. 
            Вы можете в любой момент очистить данные профиля, удалив их из браузера.
          </p>
        </div>

        <div className="privacy-section">
          <h2>7. Изменения политики</h2>
          <p>
            Мы можем обновлять политику конфиденциальности. 
            Все изменения будут опубликованы на этой странице.
          </p>
        </div>

        <div className="privacy-section">
          <h2>8. Контакты</h2>
          <p>
            По вопросам конфиденциальности обращайтесь через GitHub Issues 
            или социальные сети.
          </p>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
