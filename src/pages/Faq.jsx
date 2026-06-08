import { motion } from 'framer-motion';
import './Faq.css';

const faqData = [
  {
    question: 'Что такое AniWave?',
    answer: 'AniWave — это каталог аниме с удобным поиском, фильтрами и возможностью создавать коллекции. Сервис использует AniLibria API для получения информации об аниме.'
  },
  {
    question: 'Как добавить аниме в коллекцию?',
    answer: 'На странице аниме нажмите на кнопку "Add to collection" и выберите статус: "Смотрю", "Просмотрено" или "Запланировано". Коллекции синхронизируются с вашим аккаунтом и доступны на любом устройстве.'
  },
  {
    question: 'Как отслеживать прогресс просмотра?',
    answer: 'При просмотре аниме на странице плеера прогресс сохраняется автоматически. Вы можете продолжить просмотр с того же места на любом устройстве после входа в аккаунт.'
  },
  {
    question: 'Как изменить профиль?',
    answer: 'Перейдите на страницу профиля и нажмите кнопку "Edit Profile". Там вы можете изменить аватар, баннер, имя пользователя и описание. Аватар и баннер поддерживают GIF, PNG, JPG и WebP до 10 МБ.'
  },
  {
    question: 'Как войти через Google или GitHub?',
    answer: 'На страницах входа или регистрации нажмите на кнопку "Sign in with Google" или "Sign in with GitHub". После авторизации вы будете перенаправлены обратно в профиль.'
  },
  {
    question: 'Откуда берутся данные об аниме?',
    answer: 'Информация об аниме предоставляется через AniLibria API (anilibria.top). Данные включают название, описание, жанры, постеры и ссылки на видео.'
  },
  {
    question: 'Есть ли мобильное приложение?',
    answer: 'На данный момент AniWave доступен только в виде веб-приложения. Сайт адаптирован для мобильных устройств и планшетов.'
  },
  {
    question: 'Как связаться с нами?',
    answer: 'Вы можете написать нам на email support@aniwave.site, создать issue на GitHub (github.com/JeySerYT/AniWave-by-OpenCode) или найти нас в Telegram и Discord.'
  }
];

const Faq = () => {
  return (
    <div className="faq-page">
      <motion.div
        className="faq-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>FAQ</h1>
        <p className="faq-subtitle">Часто задаваемые вопросы</p>

        {faqData.map((item, index) => (
          <motion.section
            key={`faq-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
};

export default Faq;
