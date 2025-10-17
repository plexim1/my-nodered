const headerTitle = process.env.EDITOR_HEADER_TITLE || process.env.EDITOR_TITLE || 'my-nodered';
const pageTitle = process.env.EDITOR_PAGE_TITLE || process.env.EDITOR_TITLE || 'my-nodered';

export default {
  editorTheme: {
    theme: 'zendesk-garden',
    page: {
      title: pageTitle,
      css: ['/theme/editor.css'],
      scripts: ['/theme/editor.js'],
      favicon: '/theme/favicon.png',
    },
    header: {
      title: headerTitle,
      image: null,
      url: '/',
    },
    menu: {
      label: {
        file: {
          label: 'Project',
        },
      },
    },
  },
};

