import { Component, Prop, h, State } from '@stencil/core';
import marked from 'marked';
import { ResponsiveContainer, Heading } from '@ionic-internal/ionic-ds';
import fm from 'front-matter';
import state from '../../store';

@Component({
  tag: 'markdown-page',
  // styleUrl: 'markdown-page.scss'
})
export class MarkdownPage {

  @Prop() file: string;
  @State() markup: string;

  async componentWillLoad() {
    try {
      const fileText = await fetch(`/assets/markdown/${this.file}.md`)
        .then(response => response.text());
      const {body, attributes} = fm(fileText);
      this.markup = marked(body);

      if (attributes['description']) {
        state.description = attributes['description'];
      }
    } catch(e) {
      console.warn(e);
      this.markup = <Heading>Page Not Found</Heading>;
    }
    
  }

  render() {
    return (
      <ResponsiveContainer innerHTML={this.markup}/>
    );
  }
}
