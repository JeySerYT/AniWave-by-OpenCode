const ANILIBRIA_API_BASE = import.meta.env.DEV ? '/api/v1' : 'https://anilibria.top/api/v1';

const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const apiHeaders = { 'Accept': 'application/json' };

const buildCatalogParams = (params) => {
  const usp = new URLSearchParams();
  if (params.limit) usp.set('limit', String(params.limit));
  if (params.page) usp.set('page', String(params.page));

  const f = {};
  if (params.search) f['search'] = params.search;
  if (params.genres) f['genres'] = params.genres;
  if (params.sorting) f['sorting'] = params.sorting;
  if (params.publish_statuses) f['publish_statuses'] = params.publish_statuses;
  if (params.types) f['types'] = params.types;
  if (params.seasons) f['seasons'] = params.seasons;
  if (params.age_ratings) f['age_ratings'] = params.age_ratings;
  if (params.from_year || params.to_year) {
    f['years'] = {};
    if (params.from_year) f['years']['from_year'] = params.from_year;
    if (params.to_year) f['years']['to_year'] = params.to_year;
  }

  Object.entries(f).forEach(([key, val]) => {
    if (typeof val === 'object' && !Array.isArray(val)) {
      Object.entries(val).forEach(([subKey, subVal]) => {
        usp.set(`f[${key}][${subKey}]`, String(subVal));
      });
    } else {
      usp.set(`f[${key}]`, String(val));
    }
  });

  return usp;
};

export const anilibriaApi = {
  async getTitle(codeOrId) {
    const response = await fetchWithTimeout(
      `${ANILIBRIA_API_BASE}/anime/releases/list?aliases[]=${codeOrId}`,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    const data = await response.json();
    return data?.data?.[0] || null;
  },

  async getTitleList(params = {}) {
    const queryParams = buildCatalogParams(params);
    const response = await fetchWithTimeout(
      ANILIBRIA_API_BASE + '/anime/catalog/releases?' + queryParams,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getTitleUpdates(limit = 20) {
    return this.getTitleList({ limit, sorting: 'FRESH_AT_DESC' });
  },

  async getTitleOngoing() {
    return this.getTitleList({ limit: 50, publish_statuses: 'IS_ONGOING' });
  },

  async getTitleRandom(limit = 10) {
    const response = await fetchWithTimeout(
      ANILIBRIA_API_BASE + '/anime/releases/random?limit=' + limit,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getSchedule(day = null) {
    const url = day
      ? ANILIBRIA_API_BASE + '/anime/schedule?day=' + day
      : ANILIBRIA_API_BASE + '/anime/schedule';
    const response = await fetchWithTimeout(url, { headers: apiHeaders }, 30000);
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getGenres() {
    const response = await fetchWithTimeout(
      ANILIBRIA_API_BASE + '/anime/catalog/references/genres',
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getYears() {
    const response = await fetchWithTimeout(
      ANILIBRIA_API_BASE + '/anime/catalog/references/years',
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getReleaseById(id) {
    const response = await fetchWithTimeout(
      ANILIBRIA_API_BASE + '/anime/releases/' + id,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getTitleVideo(codeOrId) {
    return this.getTitle(codeOrId);
  },

  async getTitleByAlias(alias) {
    return this.getTitle(alias);
  },

  async searchTitles(query, filters) {
    return this.getTitleList({
      search: query,
      limit: filters?.limit || 20,
      page: filters?.page || 1,
      sorting: filters?.sorting || 'RATING_DESC',
      ...filters
    });
  },

  async getTopAnime(type, limit) {
    const sortMap = {
      'ranked': 'RATING_DESC',
      'updated': 'FRESH_AT_DESC'
    };
    return this.getTitleList({
      sorting: sortMap[type] || 'RATING_DESC',
      limit: limit || 20,
    });
  },

  async getFranchises(releaseId) {
    const response = await fetchWithTimeout(
      `${ANILIBRIA_API_BASE}/anime/franchises/release/${releaseId}`,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getFranchiseById(franchiseId) {
    const response = await fetchWithTimeout(
      `${ANILIBRIA_API_BASE}/anime/franchises/${franchiseId}`,
      { headers: apiHeaders },
      30000
    );
    if (!response.ok) throw new Error('API error: ' + response.status);
    return response.json();
  },

  async getSimilarByGenre(genreIds) {
    const results = await Promise.all(
      genreIds.map(gid =>
        this.getTitleList({ sorting: 'RATING_DESC', limit: 10, genres: String(gid) })
      )
    );
    const seen = new Set();
    const combined = [];
    for (const res of results) {
      const pool = [...(res.data || [])];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      let taken = 0;
      for (const item of pool) {
        if (taken >= 3) break;
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
          taken++;
        }
      }
    }
    return { data: combined };
  },
};

export default anilibriaApi;
