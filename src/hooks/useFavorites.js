import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

export const useCollections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState({ watching: [], completed: [], planned: [] });
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [watching, completed, planned] = await Promise.all([
        fetch(`${API_URL}/favorites?collection_type=watching`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/favorites?collection_type=completed`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/favorites?collection_type=planned`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      ]);
      setCollections({ watching, completed, planned });
    } catch (e) {
      console.error('Failed to fetch collections', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAll();
    else setCollections({ watching: [], completed: [], planned: [] });
  }, [user, fetchAll]);

  const addToCollection = useCallback(async (anime, type = 'planned') => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          anime_id: String(anime.id || anime.alias),
          title: anime.name?.main || anime.title || '',
          image: (anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src || '')?.replace(/^\//, 'https://anilibria.top/'),
          collection_type: type,
        }),
      });
      await fetchAll();
    } catch (e) {
      console.error('Failed to add to collection', e);
    }
  }, [user, fetchAll]);

  const updateCollectionType = useCallback(async (animeId, type) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/favorites/${animeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collection_type: type }),
      });
      if (res.ok) { await fetchAll(); return; }
      const allItems = [...collections.watching, ...collections.completed, ...collections.planned];
      const item = allItems.find(f => String(f.anime_id) === String(animeId));
      if (item) {
        await addToCollection({ id: item.anime_id, name: { main: item.title }, poster: { src: item.image } }, type);
      }
    } catch (e) {
      console.error('Failed to update collection type', e);
    }
  }, [user, fetchAll, collections, addToCollection]);

  const removeFromCollection = useCallback(async (animeId) => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/favorites/${animeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      await fetchAll();
    } catch (e) {
      console.error('Failed to remove from collection', e);
    }
  }, [user, fetchAll]);

  const getCollectionType = useCallback((animeId) => {
    for (const [type, items] of Object.entries(collections)) {
      if (items.some(f => String(f.anime_id) === String(animeId))) return type;
    }
    return null;
  }, [collections]);

  return {
    collections,
    loading,
    addToCollection,
    updateCollectionType,
    removeFromCollection,
    getCollectionType,
    refresh: fetchAll,
  };
};

export default useCollections;
