import { Component, h, Prop, Element } from '@stencil/core';

// interface ImgProps {
//   loading?: 'lazy';

//   path: string;

//   name: string;

//   type: string;

//   // Alternative text for image element
//   alt: string;

//   [key:string]: any;
// }

@Component({
  tag: 'site-img',
  styleUrl: 'site-img.scss',
})
export class SiteImg {
  @Element() el: HTMLElement;
  @Prop() loading?: 'lazy' = 'lazy';
  @Prop() path: string;
  @Prop() name: string;
  @Prop() type: string;
  @Prop() alt: string;
  @Prop() dimensions: string;

  render() {
    return (
    <img  src={`${this.path}${this.name}@2x.${this.type}`}
          srcset={`${this.path}${this.name}@1x.${this.type} 1x,
                  ${this.path}${this.name}@2x.${this.type} 2x`}
          loading={this.loading}
          width={this.dimensions.split('x')[0]}
          height={this.dimensions.split('x')[1]}
          alt={this.alt}/>
    )
  }
}