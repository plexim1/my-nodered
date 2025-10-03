const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const mergeObject = (target, source) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const value = source[key];

    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }

    if (isPlainObject(value)) {
      const base = isPlainObject(result[key]) ? result[key] : {};
      result[key] = mergeObject(base, value);
      continue;
    }

    result[key] = value;
  }

  return result;
};

export const deepMerge = (...sources) => {
  return sources.reduce((acc, source) => {
    if (!isPlainObject(source)) {
      return acc;
    }

    return mergeObject(acc, source);
  }, {});
};

export { isPlainObject };
