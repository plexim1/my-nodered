(function () {
  const storageKey = 'your-nodered-theme-overrides';
  const rootStyle = document.documentElement.style;

  const loadOverrides = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn('my-nodered theme: failed to read overrides from storage', error);
      return {};
    }
  };

  const persistOverrides = (overrides) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(overrides));
    } catch (error) {
      console.warn('my-nodered theme: failed to persist overrides', error);
    }
  };

  const applyOverrides = (overrides = {}) => {
    Object.entries(overrides).forEach(([variable, value]) => {
      if (typeof variable !== 'string' || !variable.startsWith('--')) {
        return;
      }

      if (value === null || value === undefined) {
        rootStyle.removeProperty(variable);
        return;
      }

      rootStyle.setProperty(variable, value);
    });
  };

  const mergeOverrides = (current, next = {}) => {
    const merged = { ...current };
    Object.entries(next).forEach(([key, value]) => {
      if (value === null) {
        delete merged[key];
      } else {
        merged[key] = value;
      }
    });
    return merged;
  };

  const currentOverrides = loadOverrides();
  applyOverrides(currentOverrides);

  const api = {
    apply(overrides) {
      const next = mergeOverrides(currentOverrides, overrides);
      applyOverrides(next);
      persistOverrides(next);
      return next;
    },
    reset() {
      Object.keys(currentOverrides).forEach((key) => {
        rootStyle.removeProperty(key);
        delete currentOverrides[key];
      });
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('my-nodered theme: failed to clear overrides', error);
      }
      return {};
    },
    get() {
      return { ...currentOverrides };
    },
  };

  window.myNoderedTheme = api;

  console.info('my-nodered theme (Zendesk Garden base) loaded');
  console.info('Customize via window.myNoderedTheme.apply({ "--red-ui-primary-background": "#1d2328" })');
  console.info('Call window.myNoderedTheme.reset() to clear persisted overrides.');
})();
