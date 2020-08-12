import { Component, Prop, h } from '@stencil/core';
import marked from 'marked';

@Component({
  tag: 'markdown-page',
  // styleUrl: 'markdown-page.scss'
})
export class MarkdownPage {

  @Prop() file: string;

  async componentWillLoad() {
    console.log(this.file, marked('# hello'));
  }

  render() {
    return (
      <h1> Gets here</h1>
    );
  }
}
