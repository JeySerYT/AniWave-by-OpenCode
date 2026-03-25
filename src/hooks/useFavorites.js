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
    const animeId = anime?.alias || anime?.code || anime?.id || anime;
    if (!animeId) return;
    
    setFavorites((prev) => {
      if (prev.some((f) => (f.alias || f.code || f.id) === animeId)) return prev;
      const newFavorites = [...prev, { alias: animeId }];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((animeId) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((a) => (a.alias || a.code || a.id) !== animeId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((animeId) => {
    return favorites.some((a) => (a.alias || a.code || a.id) === animeId);
  }, [favorites]);

  const toggleFavorite = useCallback((animeIdOrAnime) => {
    const animeId = typeof animeIdOrAnime === 'string' ? animeIdOrAnime : (animeIdOrAnime?.alias || animeIdOrAnime?.code || animeIdOrAnime?.id);
    if (!animeId) return;
    
    if (isFavorite(animeId)) {
      removeFavorite(animeId);
    } else {
      addFavorite({ alias: animeId });
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
