export default {
  // Enable Function node Setup tab for external modules
  functionExternalModules: true,

  // Allow installing/using external modules from the editor (Function node)
  externalModules: {
    // Auto-install any missing modules when deploying flows
    autoInstall: true,
    autoInstallRetry: 30,
    modules: {
      allowInstall: true,
      // Limit the selectable modules in Function node Setup
      // to the approved set below. Add more here as needed.
      allowList: ['*'],
      denyList: [],
    },
  },
};
