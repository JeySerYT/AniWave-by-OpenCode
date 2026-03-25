import { useState, useEffect, useCallback } from 'react';
import { anilibriaApi } from '../api/anilibria';

export const useTrendingAnime = (options = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await anilibriaApi.getTitleList({ sorting: 'rating', limit: 20 });
        setAnime(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  return { anime, loading, error, ...options };
};

export const usePopularAnime = (options = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await anilibriaApi.getTitleList({ sorting: 'popularity', limit: 20 });
        setAnime(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  return { anime, loading, error, ...options };
};

export const useSeasonalAnime = (year = null, season = null, options = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const params = { limit: 20 };
        if (year) {
          params.filter = 'year';
          params.year = String(year);
        }
        if (season) {
          params.filter = (params.filter ? params.filter + ',' : '') + 'season';
          params.season = season;
        }
        const data = await anilibriaApi.getTitleList(params);
        setAnime(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [year, season]);

  return { anime, loading, error, ...options };
};

export const useOngoingAnime = (options = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await anilibriaApi.getTitleOngoing();
        setAnime(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  return { anime, loading, error, ...options };
};

export const useRecentlyReleased = (options = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await anilibriaApi.getTitleUpdates(20);
        setAnime(data?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  return { anime, loading, error, ...options };
};

export const useAnimeById = (code, options = {}) => {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnime = useCallback(async () => {
    if (!code) return;
    
    setLoading(true);
    try {
      const data = await anilibriaApi.getTitle(code);
      setAnime(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  return { anime, loading, error, refetch: fetchAnime, ...options };
};

export const useAnimeCharacters = (code, options = {}) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchCharacters = async () => {
      setLoading(true);
      try {
        const data = await anilibriaApi.getTitle(code);
        setCharacters([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [code]);

  return { characters, loading, error, ...options };
};

export const useSimilarAnime = (code, options = {}) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchSimilar = async () => {
      setLoading(true);
      try {
        setSimilar([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [code]);

  return { similar, loading, error, ...options };
};

export const useRelatedAnime = (code, options = {}) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        setRelated([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [code]);

  return { related, loading, error, ...options };
};

export default {
  useTrendingAnime,
  usePopularAnime,
  useSeasonalAnime,
  useOngoingAnime,
  useRecentlyReleased,
  useAnimeById,
  useAnimeCharacters,
  useSimilarAnime,
  useRelatedAnime,
};
