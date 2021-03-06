import { createStore } from '@stencil/store';

export interface State {
  pageTheme: 'light' | 'dark'
  pageData: any,
  stickyHeader: boolean;
  title: string,
  description: string,
  meta_image: string,
  breadcrumbs: {
    base: [string, string]
  }
  showHubspotForm: boolean,
  hubspotGatedPassed: boolean
}

export const defaults = {
  title: 'Continuous Mobile DevOps',
  description: 'Move even faster with cloud native builds, live app deploys, and CI/CD automation for Ionic, Capacitor, and Cordova app delivery.',
  meta_image: '/assets/img/appflow-og-img.jpg'
}

const { state } = createStore({
  pageTheme: 'light',
  pageData: {},
  stickyHeader: true,
  title: defaults.title,
  description: defaults.description,
  meta_image: defaults.meta_image,
  showHubspotForm: false,
  hubspotGatedPassed: false

} as State);

export default state;