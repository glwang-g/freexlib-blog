import type { CollectionEntry } from 'astro:content'
import { themeConfig } from '@/config'
import { generateDescription } from '@/utils/description'
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt()
const { title, description, url } = themeConfig.site
const followConfig = themeConfig.seo?.follow

interface GenerateRSSOptions {
}

export async function generateRSS({ }: GenerateRSSOptions = {}) {
  const siteTitle = title
  const siteDescription = description

  // Get posts for specific language (including universal posts and default language when lang is undefined)
  const posts = await getCollection(
    'posts',
    ({ data }: { data: CollectionEntry<'posts'>['data'] }) =>
      !data.draft,
  )

  // Sort posts by published date in descending order
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.data.published).getTime() - new Date(a.data.published).getTime(),
  )

  return rss({
    title: siteTitle,
    site: url,
    description: siteDescription,
    stylesheet: '/rss/rss-style.xsl',
    customData: `
    <copyright>Copyright © ${new Date().getFullYear()} ${themeConfig.site.author}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${followConfig?.feedID && followConfig?.userID
        ? `<follow_challenge>
          <feedId>${followConfig.feedID}</feedId>
          <userId>${followConfig.userID}</userId>
        </follow_challenge>`
        : ''
    }
  `.trim(),
    items: sortedPosts.map((post: CollectionEntry<'posts'>) => ({
      title: post.data.title,
      // Generate URL with language prefix and abbrlink/slug
      link: new URL(
        `posts/${post.data.abbrlink || post.id}/`,
        url,
      ).toString(),
      description: generateDescription(post, 'rss'),
      pubDate: post.data.published,
      content: post.body
        ? sanitizeHtml(parser.render(post.body), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          })
        : '',
    })),
  })
}
