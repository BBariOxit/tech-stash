import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const snippetsDirectory = path.join(process.cwd(), 'content', 'snippets');

export interface SnippetMeta {
  id: string;
  title: string;
  description: string;
  language: string;
  date: string;
}

export interface Snippet extends SnippetMeta {
  content: string;
}

export function getAllSnippets(): SnippetMeta[] {
  if (!fs.existsSync(snippetsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(snippetsDirectory);
  const allSnippets = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const id = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(snippetsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const { data } = matter(fileContents);
      
      return {
        id,
        title: data.title,
        description: data.description,
        language: data.language,
        date: data.date,
      };
    });

  return allSnippets.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getSnippetById(id: string): Snippet | null {
  try {
    const fullPath = path.join(snippetsDirectory, `${id}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      id,
      title: data.title,
      description: data.description,
      language: data.language,
      date: data.date,
      content,
    };
  } catch (e) {
    return null;
  }
}
