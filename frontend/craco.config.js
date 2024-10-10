// craco.config.js

const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#0D47A1', // Fintech primary color
              '@font-family': 'Poppins, Arial, sans-serif',
              '@font-size-base': '14px',
              '@text-color': '#212121',
              '@heading-color': '#0D47A1',
              '@border-radius-base': '6px',
              '@layout-header-background': '#0D47A1',
              '@btn-primary-bg': '#0D47A1',
              '@link-color': '#0D47A1',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
