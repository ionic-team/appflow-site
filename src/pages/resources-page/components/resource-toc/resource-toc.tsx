import { h, Component, Prop, Host, Watch, State, Element } from '@stencil/core';
import { PrismicResource, PrismicDoc } from '../../../../models/prismic';
import { IntersectionHelper, Heading } from '@ionic-internal/ionic-ds';
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
  private pageTitles: HTMLElement[] = [];
  private tocTitles: HTMLElement[] = [];
  @Element() el?: HTMLElement;
  @Prop() prismicResource: PrismicResource | null = null;

  @State() headings: any[] = [];
  @State() itemOffsets: ItemOffset[] = [];
  @State() selectedId?: string;
  @State() lastVisibleId?: string;

  componentDidLoad() {
    this.headings = getHeadings(this.prismicResource!.doc);

    IntersectionHelper.addListener(({ entries }) => {
      const e = entries.find((e) => this.pageTitles.find(titleEl => titleEl === (e.target as HTMLElement)));
      if (!e) return;

      if (e.intersectionRatio === 1) {
        this.tocTitles.forEach((tocTitle) => {
          tocTitle.dataset.id === e.target.id ? tocTitle.classList.add('active') : tocTitle.classList.remove('active');
        })
      }
    });
  }

  render() {
    const { prismicResource: resource, headings, Anchor } = this;

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
          <Heading class="title" level={6}>Contents</Heading>
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

  Anchor = ({ heading, key }: AnchorProps) => {
    const href = 'h-' + slugify(heading.text);
    const level = parseInt(heading.type[heading.type.length - 1], 10);
    const target = (document.querySelector(`#${href}`) as HTMLElement);

    this.pageTitles.push(target);
    IntersectionHelper.observe(target);
    
    const offsetY = 100;
    return (
      <li
        class={`toc-item${level ? ` toc-item-level-${level}` : ``}`}
        data-id={href}
        ref={e => e ? this.tocTitles.push(e) : ''}
        key={key}
        onClick={() => { window.scrollTo({ top: target.offsetTop - offsetY, behavior: 'smooth' })} }
      >
      {heading.text}
      </li>
    );
  };
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
    <a href={url} target={target} class="cta-button">
      {cta_title}
    </a>
  );
};
