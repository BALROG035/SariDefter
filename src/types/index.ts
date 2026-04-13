export interface Note {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  tag: string;
  createdAt: string; // ISO date string
}

export type View = 'feed' | 'review';
