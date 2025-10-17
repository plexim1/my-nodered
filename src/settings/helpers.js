const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

// Merge two plain objects with cycle protection.
// Also shallow-merge certain known keys to avoid traversing complex module objects.
const mergeObject = (target, source, seen) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const value = source[key];

    if (value === undefined) continue;

    // Avoid deep traversals of module objects that can contain cycles
    if (key === 'functionGlobalContext' && isPlainObject(value)) {
      const base = isPlainObject(result[key]) ? result[key] : {};
      result[key] = { ...base, ...value };
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }

    if (isPlainObject(value)) {
      if (seen.has(value)) {
        // Cycle detected - assign by reference
        result[key] = value;
        continue;
      }
      seen.add(value);
      const base = isPlainObject(result[key]) ? result[key] : {};
      result[key] = mergeObject(base, value, seen);
      continue;
    }

    result[key] = value;
  }
  return result;
};

export const deepMerge = (...sources) => {
  const seen = new WeakSet();
  return sources.reduce((acc, source) => {
    if (!isPlainObject(source)) return acc;
    return mergeObject(acc, source, seen);
  }, {});
};

export { isPlainObject };

