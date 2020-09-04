import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

import dotenvPlugin from 'rollup-plugin-dotenv';

export const config: Config = {
  taskQueue: 'async',
  devServer: {
    openBrowser: false,
  },
  globalStyle: 'src/global/styles/base.scss',
  namespace: 'site',
  outputTargets: [
    {
      type: 'www',
      // prerenderConfig: './prerender.config.ts',
      baseUrl: 'https://useappflow.com/',
      serviceWorker: null,
      copy: [
        { src: '../node_modules/@ionic-internal/ionic-ds/www/assets/fonts', dest: 'assets/fonts' },
      ]
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: [
        ['src/global/styles/vars', '*'],
        ['src/global/styles/utils', '*'],
        ['src/global/styles/animations', '*']
      ]
    }),
    dotenvPlugin(),
  ]
};