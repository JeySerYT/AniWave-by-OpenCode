const translationCache = new Map();

export const translateToRussian = async (text, maxLength = 5000) => {
  if (!text) return '';
  const truncated = text.substring(0, maxLength);
  const cacheKey = `${truncated}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(truncated)}`
    );
    const data = await response.json();
    const translated = data[0]?.map(item => item[0]).join('') || truncated;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    return truncated;
  }
};

export const translateMultipleToRussian = async (texts) => {
  const results = {};
  const uncached = [];
  
  for (const [id, text] of texts) {
    if (translationCache.has(text)) {
      results[id] = translationCache.get(text);
    } else {
      uncached.push([id, text]);
    }
  }
  
  if (uncached.length === 0) {
    return results;
  }
  
  const promises = uncached.map(async ([id, text]) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text.substring(0, 500))}`
      );
      const data = await response.json();
      const translated = data[0]?.map(item => item[0]).join('') || text;
      translationCache.set(text, translated);
      results[id] = translated;
    } catch (error) {
      results[id] = text;
    }
  });
  
  await Promise.all(promises);
  return results;
};
