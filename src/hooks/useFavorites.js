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
    setFavorites((prev) => {
      if (prev.some((f) => f.id === anime.id)) return prev;
      const newFavorites = [...prev, anime];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((animeId) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((a) => a.id !== animeId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

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
