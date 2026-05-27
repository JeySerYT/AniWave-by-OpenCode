const ANILIBRIA_API_BASE = 'https://anilibria.top/api/v1';

const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const apiHeaders = {
  'Accept': 'application/json',
};

export const anilibriaApi = {
  async getTitle(codeOrId) {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?filter=alias&alias=' + codeOrId,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      const data = await response.json();
      return data?.data?.[0] || null;
    } catch (err) {
      console.error('GetTitle API Error:', err);
      throw err;
    }
  },

  async getTitleList(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.page) queryParams.set('page', String(params.page));
      if (params.sorting) queryParams.set('sorting', params.sorting);
      if (params.order) queryParams.set('order', params.order);

      if (params.filter) {
        const parts = params.filter.split(',').map(s => s.trim());
        parts.forEach(f => queryParams.append('filter', f));
        if (params.name) queryParams.set('name', params.name);
        if (params.year) queryParams.set('year', String(params.year));
        if (params.publish_status) queryParams.set('publish_status', params.publish_status);
        if (params.genres) queryParams.set('genres', params.genres);
        if (params.type) queryParams.set('type', params.type);
      }

      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?' + queryParams,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetTitleList API Error:', err);
      throw err;
    }
  },

  async getTitleUpdates(limit = 20) {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?sorting=updated_at&order=desc&limit=' + limit,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetTitleUpdates API Error:', err);
      throw err;
    }
  },

  async getTitleOngoing() {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?filter=publish_status&publish_status=ongoing',
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetTitleOngoing API Error:', err);
      throw err;
    }
  },

  async getTitleRandom(limit = 10) {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?sorting=random&limit=' + limit,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetTitleRandom API Error:', err);
      throw err;
    }
  },

  async getSchedule(day = null) {
    try {
      const url = day 
        ? ANILIBRIA_API_BASE + '/anime/schedule?day=' + day 
        : ANILIBRIA_API_BASE + '/anime/schedule';
      const response = await fetchWithTimeout(url, { headers: apiHeaders }, 30000);

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetSchedule API Error:', err);
      throw err;
    }
  },

  async getGenres() {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/references/genres',
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetGenres API Error:', err);
      throw err;
    }
  },

  async getYears() {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/references/years',
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetYears API Error:', err);
      throw err;
    }
  },

  async getReleaseById(id) {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/releases/' + id,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetReleaseById API Error:', err);
      throw err;
    }
  },

  async getTitleVideo(codeOrId) {
    try {
      const response = await fetchWithTimeout(
        ANILIBRIA_API_BASE + '/anime/catalog/releases?filter=alias&alias=' + codeOrId,
        { headers: apiHeaders },
        30000
      );

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      return response.json();
    } catch (err) {
      console.error('GetTitleVideo API Error:', err);
      throw err;
    }
  },

  async searchTitles(query, filters) {
    return this.getTitleList({
      search: query,
      limit: filters?.limit || 20,
      page: filters?.page || 1,
      sorting: filters?.sorting || 'rating',
      order: 'desc',
      ...filters
    });
  },

  async getTopAnime(type, limit) {
    const sortMap = {
      'ranked': 'rating',
      'popular': 'popularity',
      'updated': 'updated_at'
    };
    return this.getTitleList({
      sorting: sortMap[type] || 'rating',
      limit: limit || 20,
      order: 'desc'
    });
  },
};

export default anilibriaApi;
