import React from 'react';
import { Trash2, ChevronDown, Pencil, Eye, EyeOff, FolderPlus } from 'lucide-react';
import type { Note, Group } from '../types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  groups: Group[];
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onToggleHidden: (id: string) => void;
  onManageGroups: (noteId: string) => void;
}

function getTagStyle(): { bg: string; color: string } {
  return { bg: 'var(--accent)', color: 'var(--btn-text)' };
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  groups,
  onDelete,
  onEdit,
  onView,
  onToggleHidden,
  onManageGroups,
}) => {
  const tagStyle = getTagStyle();
  const dateStr = new Date(note.createdAt).toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const groupCount = groups.filter((g) => g.noteIds.includes(note.id)).length;

  return (
    <article className={`${styles.card} ${note.hidden ? styles.cardHidden : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.tag}
            style={{ background: tagStyle.bg, color: tagStyle.color, opacity: note.hidden ? 0.5 : 1 }}
          >
            {note.tag || 'Genel'}
          </span>
          <span className={styles.date}>{dateStr}</span>
          {note.hidden && <span className={styles.hiddenBadge}>Gizli</span>}
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.actionBtn} ${styles.groupBtn} ${groupCount > 0 ? styles.groupBtnActive : ''}`}
            onClick={() => onManageGroups(note.id)}
            aria-label="Grupları yönet"
            title="Gruba ekle / kaldır"
          >
            <FolderPlus size={15} />
            {groupCount > 0 && (
              <span className={styles.groupBadge}>{groupCount}</span>
            )}
          </button>
          <button
            className={`${styles.actionBtn} ${note.hidden ? styles.hiddenToggleActive : ''}`}
            onClick={() => onToggleHidden(note.id)}
            aria-label={note.hidden ? 'Notu tekrarda göster' : 'Notu tekrarda gizle'}
            title={note.hidden ? 'Tekrarda göster' : 'Tekrarda gizle'}
          >
            {note.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(note)}
            aria-label="Notu düzenle"
            title="Notu düzenle"
          >
            <Pencil size={15} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(note.id)}
            aria-label="Notu sil"
            title="Notu sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h2 className={styles.title}>{note.title}</h2>

      {note.description && (
        <p className={styles.description}>{note.description}</p>
      )}

      {note.codeSnippet && (
        <div className={styles.codeWrapper}>
          <div className={styles.codeHeader}>
            <span className={styles.codeDots}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.codeLang}>{note.tag || 'kod'}</span>
          </div>
          <pre className={styles.code}>
            <code>{note.codeSnippet}</code>
          </pre>
          {note.codeSnippet.split('\n').length > 8 && (
            <button
              className={`${styles.expandBtn} with-icon`}
              onClick={() => onView(note)}
            >
              <ChevronDown size={16} /> Tamamını Gör
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default NoteCard;
