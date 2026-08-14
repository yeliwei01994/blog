export interface DiaryHeading {
  depth: 2 | 3 | 4 | 5;
  slug: string;
  text: string;
}

export interface DiaryArticle {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  cover?: string;
  draft: boolean;
  html: string;
  headings: DiaryHeading[];
}
