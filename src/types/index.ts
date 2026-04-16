export interface Note {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  tag: string;
  createdAt: string;
  hidden?: boolean;
}

export interface Group {
  id: string;
  name: string;
  noteIds: string[];
  createdAt: string;
}

export type View = 'feed' | 'review';
