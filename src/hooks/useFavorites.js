import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'anilist_favorites';

const getFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const addFavorite = useCallback((anime) => {
    const newFavorites = [...favorites, anime];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  }, [favorites]);

  const removeFavorite = useCallback((animeId) => {
    const newFavorites = favorites.filter((a) => a.id !== animeId);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  }, [favorites]);

  const isFavorite = useCallback((animeId) => {
    return favorites.some((a) => a.id === animeId);
  }, [favorites]);

  const toggleFavorite = useCallback((anime) => {
    if (isFavorite(anime.id)) {
      removeFavorite(anime.id);
    } else {
      addFavorite(anime);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
