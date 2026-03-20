import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Faq.css';

const faqData = [
  {
    question: 'Что такое AniWave?',
    answer: 'AniWave — это каталог аниме с красивым дизайном и удобным поиском. Мы используем AniList API для получения актуальной информации об аниме.'
  },
  {
    question: 'Как добавить аниме в избранное?',
    answer: 'Нажмите на иконку сердца на карточке аниме или на странице аниме. Избранное сохраняется в вашем браузере.'
  },
  {
    question: 'Как изменить профиль?',
    answer: 'Перейдите на страницу профиля и нажмите кнопку "Edit Profile". Там вы можете изменить аватар, баннер, имя и описание.'
  },
  {
    question: 'Откуда берутся данные об аниме?',
    answer: 'Мы используем AniList GraphQL API — крупнейшую базу данных аниме. Информация обновляется автоматически.'
  },
  {
    question: 'Есть ли мобильное приложение?',
    answer: 'На данный момент AniWave доступен только в виде веб-приложения. Мы работаем над мобильной версией.'
  },
  {
    question: 'Как связаться с нами?',
    answer: 'Если у вас есть вопросы или предложения, вы можете написать нам через GitHub Issues или социальные сети.'
  }
];

const Faq = () => {
  return (
    <div className="faq-page">
      <motion.div 
        className="faq-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="faq-title">FAQ</h1>
        <p className="faq-subtitle">Часто задаваемые вопросы</p>
        
        <div className="faq-list">
          {faqData.map((item, index) => (
            <motion.div 
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <h3 className="faq-question">{item.question}</h3>
              <p className="faq-answer">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Faq;