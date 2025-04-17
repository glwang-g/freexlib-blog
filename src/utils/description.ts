import type { CollectionEntry } from 'astro:content'
import { defaultLocale } from '@/config'
import MarkdownIt from 'markdown-it'

type ExcerptScene = 'list' | 'meta' | 'og' | 'rss'

const parser = new MarkdownIt()
const isCJKLang = (lang: string) => ['zh', 'zh-tw', 'ja'].includes(lang)

// Excerpt length in different scenarios
const EXCERPT_LENGTHS: Record<ExcerptScene, {
  cjk: number
  other: number
}> = {
  list: {
    cjk: 120,
    other: 240,
  },
  meta: {
    cjk: 120,
    other: 240,
  },
  og: {
    cjk: 70,
    other: 140,
  },
  rss: {
    cjk: 70,
    other: 140,
  },
}

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': '\'',
  '&nbsp;': ' ',
}

// Generate an excerpt from Markdown content
export function generateExcerpt(
  content: string,
  scene: ExcerptScene,
  lang: string,
): string {
  if (!content)
    return ''

  // Remove Markdown headings
  const contentWithoutHeadings = content
    .replace(/^#{1,6}\s+\S.*$/gm, '')
    .replace(/\n{2,}/g, '\n\n')

  const length = isCJKLang(lang)
    ? EXCERPT_LENGTHS[scene].cjk
    : EXCERPT_LENGTHS[scene].other

  // Remove all HTML tags
  let plainText = parser.render(contentWithoutHeadings)
    .replace(/<[^>]*>/g, '')

  // Decode HTML entities using the mapping table
  Object.entries(HTML_ENTITIES).forEach(([entity, char]) => {
    plainText = plainText.replace(new RegExp(entity, 'g'), char)
  })

  // Replace line breaks with spaces
  const normalizedText = plainText.replace(/\s+/g, ' ')
    // Remove spaces after CJK punctuation marks
    .replace(/([。？！："」』])\s+/g, '$1')
  const excerpt = normalizedText.slice(0, length).trim()
  // Remove trailing punctuation from the excerpt
  if (normalizedText.length > length)
    return `${excerpt.replace(/\p{P}+$/u, '')}...`
  return excerpt
}

// Automatically Generate article description
export function generateDescription(
  post: CollectionEntry<'posts'>,
  scene: ExcerptScene,
): string {
  // Prioritize existing description
  if (post.data.description)
    return post.data.description

  const lang = (!post.data.lang || post.data.lang === '') ? defaultLocale : post.data.lang
  return generateExcerpt(post.body || '', scene, lang)
}
