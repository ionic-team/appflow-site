import { Component, Host, h } from '@stencil/core';

import { ResponsiveContainer, PrismicRichText, Heading, Grid, Col, Paragraph } from '@ionic-internal/ionic-ds';
import { getPage } from '../../prismic';
import state from '../../store';
import { aaaLogo, amtrakLogo, nasaLogo, ibmLogo, burgerKingLogo, catLogo, targetLogo } from '../../svgs';



@Component({
  tag: 'pricing-page',
  styleUrl: 'pricing-page.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class PricingPage {
  
  async componentWillLoad() {
    await getPage('appflow_pricing');
  }

  render = () => (
    <Host>
      <Top />
      <Tiers />
      <Companies />
      <Faq />
    </Host>
  )
}

const Top = () => {
  const { top } = state.pageData;

  return (
    <ResponsiveContainer id="top" as="section">
      <div class="heading-group">
        <PrismicRichText richText={top} paragraphLevel={2}/>
      </div> 
    </ResponsiveContainer>
  );
}

const Tiers = () => {
  return (
    <ResponsiveContainer id="tiers" as="section">
      <plan-pricing></plan-pricing>
    </ResponsiveContainer>
  );
}

const Companies = () => {
  return (
    <ResponsiveContainer id="companies" as="section">
      <Heading level={6}>Trusted by the world’s best teams</Heading>
      <div class="logos">
        <div class="wrapper">
          {aaaLogo({ main: 'var(--c-indigo-60)' }, { width: 50, height: 30 })}
          {amtrakLogo({ main: 'var(--c-indigo-60)' }, { width: 63.78, height: 26.25 })}
          {nasaLogo({ main: 'var(--c-indigo-60)' }, { width: 71.29, height: 18.75 })}
          {ibmLogo({ main: 'var(--c-indigo-60)' }, { width: 52.53, height: 21.56 })}
        </div>
        <div class="wrapper">
          {burgerKingLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)', third: 'var(--c-indigo-60)' }, { width: 30.32, height: 32 })}
          {catLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)' }, { width: 41.27, height: 24.38 })}
          {targetLogo({ main: 'var(--c-indigo-60)' }, { width: 32, height: 32 })}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

const Faq = () => {
  return (
    <ResponsiveContainer id="faq" as="section">
      <Heading level={2}>Have a Question?</Heading>
      <Grid>
        <Col cols={12} sm={6}>
          <ul class="list">
            <li>
              <Heading>How do Live Update limits work?</Heading>
              <Paragraph>Using the Ionic <a href="/pro/deploy">Deploy</a> service allows you to push hot code updates directly to your users’ devices, all from the Ionic cloud dashboard, without having to go through the app stores.</Paragraph>
              <Paragraph>A single Live Update is one code update to one device. If you send one update to 200 devices, that counts as 200 Live Updates. If you send two updates to 200 devices, that counts as 400 Live Updates.</Paragraph>
              <Paragraph>The number of Live Updates varies with each plan. The Launch plan includes 10,000 Live Updates per month. The Growth plan allows up to 25,000 Live Updates per month. The plan limits are refreshed each month. If you exceed your quota for a given month, you will have to upgrade to a higher plan, or wait until the next calendar month to send more updates.</Paragraph>
              <Paragraph>If you need more than 25,000 Live Updates, the Scale and Enterprise plans offer custom limits, based on annual usage. Ionic’s Live Update service scales to millions of units, with pricing varying based on the number of Updates in your custom plan. <a href="/sales">Contact our Sales</a> team to learn more about setting up a custom Scale or Enterprise plan.</Paragraph>
            </li>
            <li>
              <Heading>Which plans offer iOS Enterprise builds?</Heading>
              <Paragraph>For development teams that would like to use <a href="/pro/package">Ionic Package</a> to generate builds using their Apple Enterprise Program Account Certificate, a subscription to the Scale or Enterprise plan is required. The Apple Developer Enterprise Program allows large organizations to develop and deploy proprietary, internal-use apps to their employees. This program is for specific use cases that require private distribution directly to employees using secure internal systems or through a Mobile Device Management solution.</Paragraph>
            </li>
            <li>
              <Heading>What is Account &amp; Billing Support?</Heading>
              <Paragraph>Account & Billing Support is available to all plan holders, and includes access to help for issues related to account billing, refunds, cancellations and account re-activations, and password or account access related concerns.</Paragraph>
            </li>
            <li>
              <Heading>What is Premium Product Support?</Heading>
              <Paragraph>Timely assistance with troubleshooting issues related to Appflow or the Cloud dashboard.</Paragraph>
            </li>
          </ul>
        </Col>

        <Col cols={12} sm={6}>
          <ul class="list">
            <li>
              <Heading>Do I have to create an Ionic account to use the Framework?</Heading>
              <Paragraph>No. Ionic Framework is totally open source and free to download and install without an Ionic account. We invite all Ionic developers to create an account so they can take advantage of free developer tools to help you build better apps and go faster, with tools such as Ionic Deploy for sending Live Updates to your users, and a single cloud dashboard to manage all of your projects. If you just want to start building wit the Framework, freel free!</Paragraph>
            </li>
            <li>
              <Heading>What do Concurrency Limits refer to?</Heading>
              <Paragraph>Concurrency Limits refers to the number of app builds that can occur at the same time. Once you have hit your limit, additional builds will be queued until the existing builds in process are completed. When you upgrade to the Scale plan, you’ll be able to set a customized concurrency limit that matches your team’s needs and goals.</Paragraph>
            </li>
            <li>
              <Heading>What are private git repos?</Heading>
              <Paragraph>Private git repos are on-premises installations of a git service. All Ionic account plans offer a git-based workflow that works with cloud-based git services such as GitHub, BitBucket, and GitLab. For teams and businesses that wish to integrate with privately hosted git repos, we offer support for BitBucket servers as an add-on under the Scale and Enterprise plans. Contact our Sales team to learn more.</Paragraph>
            </li>
            <li>
              <Heading>How many seats are with each plan?</Heading>
              <Paragraph>The number of seats included varies by plan. Launch plans include one (1) seat. Growth plans include two (2) seats with the base subscription, with the ability to add up to five (5) team members at $99 per additional seat. Growth subscribers can add additional seats with the Developer Hub.</Paragraph>
              <Paragraph>Scale and Enterprise plans offer flexible packages that scale to any number of team members. Please contact our Sales team to discuss a custom plan that accommodates the number of seats you’d like to include. If you are a current customer and would like to add more seats to your existing Scale or Enterprise plan, please contact Support.</Paragraph>
            </li>
            <li>
              <Heading>What is the Enterprise Support SLA?</Heading>
              <Paragraph>You can customize your SLA as part of an Enterprise plan based on your specific requirements.</Paragraph>
            </li>
          </ul>
        </Col>
      </Grid>
    </ResponsiveContainer>
  );
}