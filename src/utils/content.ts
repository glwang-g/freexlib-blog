import type { CollectionEntry } from 'astro:content'
import { getCollection, render } from 'astro:content'

// Type definitions
export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

// Add metadata including reading time to post
async function addMetaToPost(post: CollectionEntry<'posts'>): Promise<Post> {
  const { remarkPluginFrontmatter } = await render(post)
  return { ...post, remarkPluginFrontmatter: remarkPluginFrontmatter as { minutes: number } }
}


/**
 * Get all posts (including pinned ones, excluding drafts in production)
 * @param lang Language code, optional, defaults to site's default language
 * @returns Posts filtered by language, enhanced with metadata, sorted by date
 */
export async function getPosts() {
  const filteredPosts = await getCollection(
    'posts',
    ({ data }: CollectionEntry<'posts'>) => {
      // Show drafts in dev mode only
      const shouldInclude = import.meta.env.DEV || !data.draft
      return shouldInclude 
    },
  )

  const enhancedPosts = await Promise.all(filteredPosts.map(addMetaToPost))

  return enhancedPosts.sort((a: Post, b: Post) =>
    b.data.published.valueOf() - a.data.published.valueOf(),
  )
}

/**
 * Get all non-pinned posts
 * @param lang Language code, optional, defaults to site's default language
 * @returns Regular posts (not pinned), already filtered by language and drafts
 */
export async function getRegularPosts() {
  const posts = await getPosts()
  return posts.filter(post => !post.data.pin)
}

/**
 * Get pinned posts and sort by pin priority
 * @param lang Language code, optional, defaults to site's default language
 * @returns Pinned posts sorted by pin value in descending order
 */
export async function getPinnedPosts() {
  const posts = await getPosts()
  return posts
    .filter(post => post.data.pin && post.data.pin > 0)
    .sort((a, b) => (b.data.pin || 0) - (a.data.pin || 0))
}

/**
 * Group posts by year and sort within each year
 * @param lang Language code, optional, defaults to site's default language
 * @returns Map of posts grouped by year (descending), with posts in each year sorted by date (descending)
 */
export async function getPostsByYear(): Promise<Map<number, Post[]>> {
  const posts = await getRegularPosts()
  const yearMap = new Map<number, Post[]>()

  posts.forEach((post: Post) => {
    const year = post.data.published.getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  yearMap.forEach((yearPosts) => {
    yearPosts.sort((a, b) => {
      const aDate = a.data.published
      const bDate = b.data.published
      return bDate.getMonth() - aDate.getMonth() || bDate.getDate() - aDate.getDate()
    })
  })

  return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
}

/**
 * Get all tags sorted by post count
 * @param lang Language code, optional, defaults to site's default language
 * @returns Array of tags sorted by popularity (most posts first)
 */
export async function getAllTags() {
  const tagMap = await getPostsGroupByTags()
  const tagsWithCount = Array.from(tagMap.entries())

  tagsWithCount.sort((a, b) => b[1].length - a[1].length)
  return tagsWithCount.map(([tag]) => tag)
}

/**
 * Group posts by their tags
 * @param lang Language code, optional, defaults to site's default language
 * @returns Map where keys are tag names and values are arrays of posts with that tag
 */
export async function getPostsGroupByTags() {
  const posts = await getPosts()
  const tagMap = new Map<string, Post[]>()

  posts.forEach((post: Post) => {
    post.data.tags?.forEach((tag: string) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, [])
      }
      tagMap.get(tag)!.push(post)
    })
  })

  return tagMap
}

/**
 * Get all posts that contain a specific tag
 * @param tag The tag name to filter posts by
 * @param lang Language code, optional, defaults to site's default language
 * @returns Array of posts that contain the specified tag
 */
export async function getPostsByTag(tag: string) {
  const tagMap = await getPostsGroupByTags()
  return tagMap.get(tag) || []
}
