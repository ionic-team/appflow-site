import { createStore } from '@stencil/store';

export interface State {
  pageTheme: 'light' | 'dark'
  pageData: any,
  title: string,
  description: string,
  meta_image: string
}

export const defaults = {
  title: 'Appflow - Continuous Mobile DevOps',
  description: 'Move even faster with cloud native builds, live app deploys, and CI/CD automation for Ionic, Capacitor, and Cordova app delivery.',
  meta_image: 'https://useappflow.com/img/meta/ionic-framework-og.png'
}

const { state } = createStore({
  pageTheme: 'light',
  pageData: {},
  title: defaults.title,
  description: defaults.description,
  meta_image: defaults.meta_image
} as State);

export default state;