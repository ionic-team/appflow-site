import { h, Component, Prop, Host, Watch, State, Element } from '@stencil/core';
import { PrismicResource, PrismicDoc } from '../../../../models/prismic';
import { AnchorButton, IntersectionHelper } from '@ionic-internal/ionic-ds';
import { slugify } from '../../../../utils/slugify';
import { getResourceUrl } from '../../../../utils/urls';

// import { ScrollSpyConsumer, ScrollSpyContext } from './ds/ScrollSpy';
interface ItemOffset {
  id: string;
  topOffset?: number;
}

@Component({
  tag: 'resource-toc',
  styleUrl: 'resource-toc.scss',
  scoped: true,
})
export class ResourceTOC {
  @Element() el?: HTMLResourceTocElement;
  @Prop() prismicResource: PrismicResource | null = null;

  @State() headings: any[] = [];
  @State() itemOffsets: ItemOffset[] = [];
  @State() selectedId?: string;
  @State() lastVisibleId?: string;

  componentDidLoad() {
    this.headings = getHeadings(this.prismicResource!.doc);

    IntersectionHelper.addListener(({ visible }) => {
      for (const h of this.headings) {
        const id = slugify(h.text);
        if (visible.some((e) => e.id === id)) {
          this.lastVisibleId = id;
          return;
        }
      }
    });
  }

  render() {
    const { prismicResource: resource, headings } = this;

    if (!resource) {
      return null;
    }

    const levels = Object.keys(
      headings.reduce((levels: any, h: any) => {
        const level = parseInt(h.type[h.type.length - 1], 10);

        levels[level] = true;

        return levels;
      }, {}),
    ).length;

    return (
      <Host>
        <nav>
          <h4>Contents</h4>
          <ul>
            {headings.map((heading: any) => {
              const href = slugify(heading.text);

              const isActive = this.lastVisibleId === href;

              return <Anchor heading={heading} key={heading.text} isActive={isActive} levels={levels} />;
            })}
            {resource.doc.data.cta_title ? <CTAButton doc={resource.doc} /> : null}
          </ul>
          <Sharing resource={resource} />
        </nav>
      </Host>
    );
  }
}

const Sharing = ({ resource }: { resource: PrismicResource }) => {
  const encodedTitle = encodeURIComponent(resource.title);
  const encodedUrl = `https://ionicframework.com${encodeURIComponent(getResourceUrl(resource))}`;

  return (
    <ul class="sharing">
      <li>
        <a
          href={`http://twitter.com/home?status=${encodedTitle}+${encodedUrl}`}
          onClick={(e: any) => {
            window.open(e.target.href, 'Share via Twitter', 'width=400, height=300');
            return false;
          }}>
          <ion-icon name="logo-twitter"></ion-icon>
        </a>
      </li>
      <li>
        <a
          href={`http://www.facebook.com/share.php?u=${encodedUrl}&amp;title=${encodedTitle}`}
          onClick={(e: any) => {
            window.open(e.target.href, 'Share via Facebook', 'width=555, height=656');
            return false;
          }}>
          <ion-icon name="logo-facebook"></ion-icon>
        </a>
      </li>
      <li>
        <a
          href={`http://www.linkedin.com/shareArticle?mini=true&amp;url=${encodedUrl}&amp;title=${encodedTitle}&amp;source=${encodeURIComponent(
            'https://ionicframework.com',
          )}`}
          onClick={(e: any) => {
            window.open(e.target.href, 'Share via LinkedIn', 'width=500, height=600');
            return false;
          }}>
          <ion-icon name="logo-linkedin"></ion-icon>
        </a>
      </li>
      <li id="web-share">
        <a>
          <ion-icon name="share"></ion-icon>
        </a>
      </li>
    </ul>
  );
};

interface AnchorProps {
  heading: any;
  isActive: boolean;
  levels: number;
  key: string;
}

const getHeadings = (doc: PrismicDoc) => {
  const textSections = doc.data.body.filter((b: any) => b.slice_type === 'normal_text');

  return textSections
    .map((b: any) => {
      return b.primary.content.filter((s: any) => ['heading2', 'heading3'].indexOf(s.type) >= 0);
    })
    .flat(2);
};

const CTAButton = ({ doc }: { doc: PrismicDoc }) => {
  const { url, target } = doc.data.cta_link;
  const { cta_title } = doc.data;
  return (
    <AnchorButton href={url} target={target} class="cta-button">
      {cta_title}
    </AnchorButton>
  );
};

const Anchor = ({ heading, isActive, key }: AnchorProps) => {
  const href = slugify(heading.text);
  const level = parseInt(heading.type[heading.type.length - 1], 10);
  return (
    <li class={`toc-item${level ? ` toc-item-level-${level}` : ``}${isActive ? ` toc-item-active` : ``}`} key={key}>
      <a href={`#${href}`}>{heading.text}</a>
    </li>
  );
};
