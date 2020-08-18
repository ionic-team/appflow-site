import { h } from '@stencil/core';
import { href } from 'stencil-router-v2';
import { Heading, DateTime } from '@ionic-internal/ionic-ds';
import parseISO from 'date-fns/parseISO';

import Router from '../../router';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

const getBlogPostPath = (doc: RenderedBlog) => `/blog/${doc.slug}`;
// const getAbsoluteBlogPostUrl = (doc: RenderedBlog) => `https://capacitorjs.com${getBlogPostPath(doc)}`;

export const BlogPost = ({ post, single = true }: { post: RenderedBlog, single?: boolean }) => {
  const content = single ?
                    post.html :
                    post.preview || post.html;

  return (
    <div class="blog-post__wrap">
      <div class="blog-post">
        <Heading level={2}><a href={getBlogPostPath(post)}>{post.title}</a></Heading>
        <PostAuthor authorName={post.authorName} authorUrl={post.authorUrl} dateString={post.date} />

        {post.featuredImage && <PostFeaturedImage post={post} />}

        <PostContent html={content} />

        {!single && post.preview ? <PostContinueReading post={post} /> : null}

        {/*
        {single && <disqus-comments url={getAbsoluteBlogPostUrl(post)} siteId='capacitor' id={post.slug} />}
        */}
      </div>
    </div>
  )
}

const PostFeaturedImage = ({ post }: { post: RenderedBlog}) => (
  <img class="blog-post__featured-image" src={post.featuredImage} alt={post.featuredImageAlt} />
);

const PostContent = ({ html }: { html: string }) => (
  <div innerHTML={html} />
);

const PostContinueReading = ({ post }: { post: RenderedBlog }) => 
  <a class="blog-post__continue-reading" {...href(getBlogPostPath(post), Router)}>Continue reading <ion-icon name="arrow-forward" /></a>

const PostAuthor = ({ authorName, authorUrl, dateString }: { authorName: string, authorUrl: string, dateString: string }) => {
  const date = parseISO(dateString);

  return (
    <div class="blog-post__author">
      {/*<img src={a.author_avatar.url} alt={a.author_name} />*/}
      <span>By {authorUrl ?
        <a href={authorUrl} target="_blank">{authorName}</a> :
        authorName} on <DateTime date={date} /></span>
    </div>
  );
}