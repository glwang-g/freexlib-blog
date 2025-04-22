
// Removes leading and trailing slashes from a path
export function cleanPath(path: string) {
  return path.replace(/^\/|\/$/g, '')
}

// Checks if the current path is the home/post/tag/about page
export function isHomePage(path: string) {
  const clean = cleanPath(path)
  return clean === ''
}
export function isPostPage(path: string) {
  const clean = cleanPath(path)
  return clean.startsWith('posts')
}
export function isTagPage(path: string) {
  const clean = cleanPath(path)
  return clean.startsWith('tags')
}
export function isAboutPage(path: string) {
  const clean = cleanPath(path)
  return clean.startsWith('about')
}

// Returns page context including language and page type information
export function getPageInfo(path: string) {
  return {
    isHome: isHomePage(path),
    isPost: isPostPage(path),
    isTag: isTagPage(path),
    isAbout: isAboutPage(path),
    getLocalizedPath: (targetPath: string) => {
      const cleanP = cleanPath(targetPath)
      return cleanP===''?'/':`/${cleanP}/`
    },
  }
}
