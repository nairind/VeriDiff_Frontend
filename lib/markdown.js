import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'content/blog');

// Get all blog post slugs
export function getAllPostSlugs() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.log('Blog directory does not exist yet');
      return [];
    }
    const filenames = fs.readdirSync(postsDirectory);
    return filenames
      .filter(name => name.endsWith('.md'))
      .map(name => name.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

// Get all blog posts with metadata
export function getAllPosts() {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  
  return posts;
}

// Get a single blog post by slug
export function getPostBySlug(slug) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      console.error(`Post file not found: ${fullPath}`);
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      content,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      lastModified: data.lastModified || data.date || '',
      readTime: data.readTime || calculateReadTime(content),
      category: data.category || 'General',
      tags: data.tags || [],
      featured: data.featured || false,
      author: data.author || 'VeriDiff Team',
      wordCount: data.wordCount || calculateWordCount(content),
      featuredImage: data.featuredImage || '',
      tableOfContents: data.tableOfContents || false,
      faq: data.faq || null,
      ...data
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// Convert markdown to HTML
export async function markdownToHtml(markdown) {
  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown support
    .use(html, { sanitize: false })
    .process(markdown);
  
  return result.toString();
}

// Calculate estimated read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Calculate word count
function calculateWordCount(content) {
  return content.trim().split(/\s+/).length;
}

// Get related posts based on category and tags
export function getRelatedPosts(currentPost, limit = 3) {
  const allPosts = getAllPosts().filter(post => post.slug !== currentPost.slug);
  
  // Score posts based on category and tag matches
  const scoredPosts = allPosts.map(post => {
    let score = 0;
    
    // Category match
    if (post.category === currentPost.category) {
      score += 10;
    }
    
    // Tag matches
    const commonTags = post.tags.filter(tag => 
      currentPost.tags.includes(tag)
    );
    score += commonTags.length * 5;
    
    return { ...post, score };
  });
  
  // Sort by score and return top results
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
