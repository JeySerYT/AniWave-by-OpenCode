import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <motion.div 
        className="terms-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="terms-title">Условия использования</h1>
        <p className="terms-date">Последнее обновление: Март 2026</p>
        
        <div className="terms-section">
          <h2>1. Общие положения</h2>
          <p>
            Используя AniWave, вы соглашаетесь с настоящими условиями. 
            Сервис предоставляется "как есть" без каких-либо гарантий.
          </p>
        </div>

        <div className="terms-section">
          <h2>2. Описание сервиса</h2>
          <p>
            AniWave — это каталог аниме, предоставляющий информацию об аниме-сериалах и фильмах. 
            Мы не храним контент на наших серверах — вся информация берется из AniList API.
          </p>
        </div>

        <div className="terms-section">
          <h2>3. Интеллектуальная собственность</h2>
          <p>
            Все данные об аниме принадлежат их правообладателям. 
            Мы не претендуем на права на какой-либо контент. 
            Логотип и дизайн AniWave являются нашей собственностью.
          </p>
        </div>

        <div className="terms-section">
          <h2>4. Использование данных</h2>
          <p>
            Данные, которые вы сохраняете в профиле (аватар, баннер, описание), 
            хранятся локально в вашем браузере. Мы не имеем доступа к этим данным.
          </p>
        </div>

        <div className="terms-section">
          <h2>5. Ограничение ответственности</h2>
          <p>
            Мы не несём ответственности за точность данных, предоставляемых AniList API. 
            Все решения о просмотре аниме принимаются пользователем самостоятельно.
          </p>
        </div>

        <div className="terms-section">
          <h2>6. Изменения условий</h2>
          <p>
            Мы оставляем право изменять условия использования в любое время. 
            Продолжая использовать сервис, вы соглашаетесь с обновленными условиями.
          </p>
        </div>

        <div className="terms-section">
          <h2>7. Контакты</h2>
          <p>
            По вопросам использования обращайтесь через GitHub Issues или социальные сети.
          </p>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Terms;