import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/content';
import { withBase } from '../lib/urls';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  return new Response(JSON.stringify(posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    href: withBase(`/posts/${post.id}/`),
    tags: post.data.tags,
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
