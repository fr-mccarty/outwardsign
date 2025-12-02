import { MetadataRoute } from 'next'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'https://outwardsign.church'

// Recursively get all markdown files from a directory
function getMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []

  try {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...getMarkdownFiles(fullPath, baseDir))
      } else if (item.endsWith('.md')) {
        // Get relative path from base directory
        const relativePath = fullPath.replace(baseDir + '/', '')
        files.push(relativePath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return files
}

// Convert markdown file path to URL path
function mdPathToUrl(filePath: string, lang: string): string {
  // Remove .md extension and convert to URL path
  const urlPath = filePath.replace('.md', '')
  return `/documentation/${lang}/${urlPath}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const contentDir = join(process.cwd(), 'src/app/documentation/content')
  const enDir = join(contentDir, 'en')
  const esDir = join(contentDir, 'es')

  const urls: MetadataRoute.Sitemap = []

  // Add homepage
  urls.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1.0,
  })

  // Add documentation home pages
  urls.push({
    url: `${BASE_URL}/documentation`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  urls.push({
    url: `${BASE_URL}/documentation/en`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  urls.push({
    url: `${BASE_URL}/documentation/es`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  // Get English documentation pages
  try {
    const enFiles = getMarkdownFiles(enDir, enDir)
    for (const file of enFiles) {
      urls.push({
        url: `${BASE_URL}${mdPathToUrl(file, 'en')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch (error) {
    console.error('Error processing English documentation:', error)
  }

  // Get Spanish documentation pages
  try {
    const esFiles = getMarkdownFiles(esDir, esDir)
    for (const file of esFiles) {
      urls.push({
        url: `${BASE_URL}${mdPathToUrl(file, 'es')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch (error) {
    console.error('Error processing Spanish documentation:', error)
  }

  return urls
}
