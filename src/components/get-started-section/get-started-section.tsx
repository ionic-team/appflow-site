import { Component, h } from '@stencil/core';
import { ResponsiveContainer, Heading, Paragraph } from '@ionic-internal/ionic-ds';

@Component({
  tag: 'get-started-section',
  styleUrl: 'get-started-section.scss',
  scoped: true
})
export class GetStartedSection{

  render() {
    return (
      <section>
        <ResponsiveContainer>
          <div class="heading-group">
            <Heading>Appflow is an integrated mobile DevOps platform for modern app teams and businesses.</Heading>
            <Paragraph level={1}>Ready to make life easier?</Paragraph>
          </div>
          <a class="cta button" href="https://ionicframework.com/signup?source=appflow-site&product=appflow">Get started - it's free to try</a>
        </ResponsiveContainer>
      </section>
    );
  }
}
