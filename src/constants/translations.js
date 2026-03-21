export const genreTranslations = {
  'Action': 'Боевик',
  'Adventure': 'Приключения',
  'Comedy': 'Комедия',
  'Drama': 'Драма',
  'Fantasy': 'Фэнтези',
  'Horror': 'Ужасы',
  'Mystery': 'Детектив',
  'Romance': 'Романтика',
  'Sci-Fi': 'Научная фантастика',
  'Slice of Life': 'Повседневность',
  'Sports': 'Спорт',
  'Supernatural': 'Сверхъестественное',
  'Thriller': 'Триллер',
  'Ecchi': 'Этти',
  'Mecha': 'Меха',
  'Music': 'Музыка',
  'Psychological': 'Психология',
  'Shounen': 'Сёнен',
  'Shoujo': 'Сёдзё',
  'Seinen': 'Сэйнен',
  'Isekai': 'Исекай',
  'Mahou Shoujo': 'Махо-сёдзё',
  'Gore': 'Гор',
  'Yaoi': 'Яой',
  'Yuri': 'Юри',
  'Harem': 'Гарем',
  'School': 'Школа',
  'Space': 'Космос',
  'Military': 'Военное',
  'Martial Arts': 'Боевые искусства',
  'Samurai': 'Самураи',
  'Cars': 'Гонки',
  'Game': 'Игры',
  'Demons': 'Демоны',
  'Vampire': 'Вампиры',
};

export const statusTranslations = {
  'FINISHED': 'Вышло',
  'RELEASING': 'Сейчас выходит',
  'NOT_YET_RELEASED': 'Не вышло',
  'CANCELLED': 'Отменено',
  'HIATUS': 'На паузе',
  'Finished': 'Вышло',
  'Airing': 'Сейчас выходит',
  'Not Yet Released': 'Не вышло',
  'Cancelled': 'Отменено',
  'On Hiatus': 'На паузе',
};

export const formatTranslations = {
  'TV': 'ТВ',
  'TV_SHORT': 'ТВ (короткий)',
  'MOVIE': 'Фильм',
  'SPECIAL': 'Спешал',
  'OVA': 'ОВА',
  'ONA': 'ОВА (веб)',
  'MUSIC': 'Музыка',
  'MANGA': 'Манга',
  'NOVEL': 'Ранобэ',
  'ONE_SHOT': 'Ваншот',
};

export const seasonTranslations = {
  'WINTER': 'Зима',
  'SPRING': 'Весна',
  'SUMMER': 'Лето',
  'FALL': 'Осень',
};

export const sourceTranslations = {
  'ORIGINAL': 'Оригинал',
  'MANGA': 'Манга',
  'LIGHT_NOVEL': 'Ранобэ',
  'VISUAL_NOVEL': 'Вижуал Новелла',
  'VIDEO_GAME': 'Видеоигра',
  'OTHER': 'Другое',
  'NOVEL': 'Ранобэ',
  'DOUJIN': 'Додзинси',
  'ANIME': 'Аниме',
};

export const countryTranslations = {
  'JP': 'Япония',
  'KR': 'Корея',
  'CN': 'Китай',
  'US': 'США',
};

export const roleTranslations = {
  'MAIN': 'Главный',
  'SUPPORTING': 'Второстепенный',
  'BACKGROUND': 'Эпизодический',
};

export const translateGenre = (genre) => {
  return genreTranslations[genre] || genre;
};

export const translateStatus = (status) => {
  return statusTranslations[status] || status;
};

export const translateFormat = (format) => {
  return formatTranslations[format] || format;
};

export const translateSeason = (season) => {
  return seasonTranslations[season] || season;
};

export const translateSource = (source) => {
  return sourceTranslations[source] || source;
};

export const translateCountry = (country) => {
  return countryTranslations[country] || country;
};

export const translateRole = (role) => {
  return roleTranslations[role] || role;
};
