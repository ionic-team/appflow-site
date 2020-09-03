import { h, Component, Prop, Listen, Watch } from '@stencil/core';
import { slugify } from 'src/utils/slugify';

interface headingsProps {
  headingEl?: HTMLElement,
  tocEl?: HTMLElement,
  inView?: boolean,
  top?: number
}

@Component({
  tag: 'resource-toc',
  styleUrl: 'resource-toc.scss',
  scoped: true,
})
export class ResourceTOC {
  private headings = new Map<string, headingsProps>()

  @Prop() titleNames!: string[];

  componentDidLoad() {
    this.updateItemOffsets();
    setTimeout(() => this.updateItemOffsets(), 2000);
  }

  @Listen('scroll', { target: 'window', passive: true })
  function() {
    requestAnimationFrame(() => {
      this.checkInView();
      this.getFirstInView();
    })
  }

  @Watch('links')
  @Listen('resize', { target: 'window' })
  updateItemOffsets() {
    requestAnimationFrame(() => {
      this.titleNames.map((title, i) => {
        const slug = slugify(title);
        const item = document.getElementById(i === 0 ? slug : `h-${slug}`)!;
        this.headings.set(slug, { ...this.headings.get(slug), headingEl: item, top: item.offsetTop });
      });
    });
  }

  checkInView() {
    for (const [ key, val ] of this.headings.entries()) {
      if (!val.top) continue;

      (val.top > window.scrollY && val.top < window.innerHeight + window.scrollY)
        ? this.headings.set(key, { ...this.headings.get(key), inView: true })
        : this.headings.set(key, { ...this.headings.get(key), inView: false });
    }
  }

  getFirstInView() {
    let gotFirst = false;

    for (const val of this.headings.values()) {
      if (!val.tocEl) continue;

      if (val.inView && !gotFirst) {
        val.tocEl.classList.add('active');
        gotFirst = true;
      } else {
        val.tocEl.classList.remove('active');
      }
    }

    if (!gotFirst) {
      const { tocEl } = [...this.headings.values()].reduce((acc, cur, i) => {
        if (i === 0 || !acc.top) return cur;
        if (!cur.top) return acc;

        if (cur.top - window.scrollY > acc.top - window.scrollY) {
          return acc;
        } else {
          return cur;
        }
      })

      tocEl?.classList.add('active');
    }
  }

  handleTocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;    
    if (!target?.dataset?.id) return;

    const value = this.headings.get(target.dataset.id);
    if (!value?.top) return;

    window.scrollTo({
      top: value.top - 100,
      behavior: 'smooth'
    })
  }

  render() {
    return (
      <nav>
        <ul>
          {this.titleNames.map(link => (
            <li
              class="ui-paragraph-4"
              onClick={(ev) => this.handleTocClick(ev)}
              data-id={slugify(link)}
              ref={e => {
                const id = e?.dataset?.id;
                if (!id || !e) return;
                this.headings.set(id, { ...this.headings.get(id), tocEl: (e as HTMLElement) });
              }}
            >{link}</li>
          ))}
        </ul>
      </nav>
    )
  }
}