import { Component, Host, h} from '@stencil/core';

// import { ResponsiveContainer, Grid, Col, Button, PrismicRichText, Heading } from '@ionic-internal/ionic-ds';
import { getPage } from '../../prismic';
// import state from '../../store';

@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss',
})
export class LandingPage {

  async componentWillLoad() {
    await getPage('appflow_homepage');
  }

  render() {
    // const page = state.pageData;

    return (
    <Host>
      <header>
        <appflow-site-header></appflow-site-header>
      </header>

      <main>

      </main>

      <footer>

      </footer>
    </Host>
    );
  }
}