import React, { useState, useMemo, useEffect } from 'react';
import { Notebook, Repeat, ArrowLeft, ArrowRight, Tag, List, Folder, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Note, Group } from '../types';
import styles from './ReviewMode.module.css';

interface ReviewModeProps {
  notes: Note[];
  groups: Group[];
  isLeftDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const ALL_GROUP = '__all__';

const ReviewMode: React.FC<ReviewModeProps> = ({ notes, groups, isLeftDrawerOpen, onCloseDrawer }) => {
  const visibleNotes = useMemo(() => notes.filter((n) => !n.hidden), [notes]);

  const tagGroups = useMemo(
    () => Array.from(new Set(visibleNotes.map((n) => n.tag || 'Genel'))).sort(),
    [visibleNotes]
  );

  const customGroups = useMemo(
    () => groups.filter((g) => g.noteIds.some((id) => visibleNotes.some((n) => n.id === id))),
    [groups, visibleNotes]
  );

  const [selectedGroup, setSelectedGroup] = useState<string>(ALL_GROUP);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(() => localStorage.getItem('devnotes_sidebar_tags') !== 'false');
  const [customExpanded, setCustomExpanded] = useState(() => localStorage.getItem('devnotes_sidebar_groups') !== 'false');

  useEffect(() => {
    localStorage.setItem('devnotes_sidebar_tags', String(tagsExpanded));
  }, [tagsExpanded]);

  useEffect(() => {
    localStorage.setItem('devnotes_sidebar_groups', String(customExpanded));
  }, [customExpanded]);

  const shuffled = useMemo(() => {
    let pool: Note[];
    if (selectedGroup === ALL_GROUP) {
      pool = visibleNotes;
    } else if (selectedGroup.startsWith('__custom__')) {
      const groupId = selectedGroup.replace('__custom__', '');
      const group = groups.find((g) => g.id === groupId);
      pool = group ? visibleNotes.filter((n) => group.noteIds.includes(n.id)) : [];
    } else {
      pool = visibleNotes.filter((n) => (n.tag || 'Genel') === selectedGroup);
    }
    return seededShuffle(pool, getDaySeed());
  }, [visibleNotes, selectedGroup, groups]);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setIndex(0);
    setDirection(null);
  };

  const go = (dir: 'next' | 'prev') => {
    setDirection(dir);
    setTimeout(() => {
      setIndex((i) =>
        dir === 'next'
          ? (i + 1) % shuffled.length
          : (i - 1 + shuffled.length) % shuffled.length
      );
      setDirection(null);
    }, 180);
  };

  if (visibleNotes.length === 0) {
    return (
      <div className={`${styles.wrapper} ${styles.emptyWrapper}`}>
        <div className="empty-state">
          <div className="empty-icon"><Notebook size={64} /></div>
          <h2 className="empty-title">Tekrar için görünür not yok!</h2>
          <p className="empty-sub">
            Notlarınızın tümü gizli veya hiç not eklemediniz.
            Akış ekranında <strong>göz simgesine</strong> tıklayarak notları tekrara ekleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  const current = shuffled[index];

  return (
    <div className={`${styles.wrapper} ${isLeftDrawerOpen ? styles.drawerOpen : ''}`}>
      <aside className={`${styles.leftSidebar} ${isLeftDrawerOpen ? styles.sidebarOpen : ''}`}>
        <div className="drawer-header mobile-only">
          <h3>Tekrar Filtreleri</h3>
          <button className="drawer-close" onClick={onCloseDrawer}><X size={20} /></button>
        </div>
        <div className={styles.sidebarStats}>
          <div className={styles.sidebarStat}>
            <span className={styles.sidebarStatNum}>{visibleNotes.length}</span>
            <span className={styles.sidebarStatLabel}>Not</span>
          </div>
          <div className={styles.sidebarStat}>
            <span className={styles.sidebarStatNum}>{shuffled.length}</span>
            <span className={styles.sidebarStatLabel}>Seçili</span>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <button
            className={styles.sidebarSectionHeader}
            onClick={() => setTagsExpanded((v) => !v)}
          >
            <span className={`${styles.sidebarSectionTitle} with-icon`}>
              <Tag size={12} /> Etiketler
            </span>
            {tagsExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          {tagsExpanded && (
            <div className={styles.sidebarItems}>
              <button
                className={`${styles.sidebarItem} ${selectedGroup === ALL_GROUP ? styles.sidebarItemActive : ''}`}
                onClick={() => handleGroupChange(ALL_GROUP)}
              >
                <List size={12} className={styles.sidebarItemIcon} />
                <span className={styles.sidebarItemName}>Tümü</span>
                <span className={styles.sidebarItemCount}>{visibleNotes.length}</span>
              </button>
              {tagGroups.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.sidebarItem} ${selectedGroup === tag ? styles.sidebarItemActive : ''}`}
                  onClick={() => handleGroupChange(tag)}
                >
                  <span className={styles.sidebarDot} />
                  <span className={styles.sidebarItemName}>{tag}</span>
                  <span className={styles.sidebarItemCount}>
                    {visibleNotes.filter((n) => (n.tag || 'Genel') === tag).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {customGroups.length > 0 && (
          <div className={styles.sidebarSection}>
            <button
              className={styles.sidebarSectionHeader}
              onClick={() => setCustomExpanded((v) => !v)}
            >
              <span className={`${styles.sidebarSectionTitle} with-icon`}>
                <Folder size={12} /> Özel Gruplar
              </span>
              {customExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {customExpanded && (
              <div className={styles.sidebarItems}>
                {customGroups.map((g) => {
                  const key = `__custom__${g.id}`;
                  const count = visibleNotes.filter((n) => g.noteIds.includes(n.id)).length;
                  return (
                    <button
                      key={g.id}
                      className={`${styles.sidebarItem} ${styles.sidebarItemCustom} ${selectedGroup === key ? styles.sidebarItemActive : ''}`}
                      onClick={() => handleGroupChange(key)}
                    >
                      <Folder size={11} className={styles.sidebarItemIcon} />
                      <span className={styles.sidebarItemName}>{g.name}</span>
                      <span className={styles.sidebarItemCount}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </aside>

      {isLeftDrawerOpen && <div className="drawer-overlay" onClick={onCloseDrawer} />}

      <div className={styles.centerContent}>
        {shuffled.length === 0 ? (
          <div className={styles.scene} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.card} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Bu grupta görünür not yok.</p>
            </div>
          </div>
        ) : (
          <div className={styles.scene}>
            <div
              className={`${styles.card} ${
                direction === 'next' ? styles.exitLeft : direction === 'prev' ? styles.exitRight : ''
              }`}
            >
              <span
                className={styles.cardTag}
                style={{ background: 'var(--accent)', color: 'var(--btn-text)' }}
              >
                {current.tag || 'Genel'}
              </span>
              <h2 className={styles.cardTitle}>{current.title}</h2>
              {current.description && <p className={styles.cardDesc}>{current.description}</p>}
              {current.codeSnippet && (
                <div className={styles.codeBlock}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeDots}><span /><span /><span /></span>
                  </div>
                  <pre className={styles.code}><code>{current.codeSnippet}</code></pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.nav}>
          <button
            className={`${styles.navBtn} with-icon`}
            onClick={() => go('prev')}
            disabled={shuffled.length <= 1}
          >
            <ArrowLeft size={18} /> Önceki
          </button>
          <button
            className={`${styles.navBtn} ${styles.navBtnPrimary} with-icon`}
            onClick={() => go('next')}
            disabled={shuffled.length <= 1}
          >
            Sonraki <ArrowRight size={18} />
          </button>
        </div>

        <p className={styles.shuffleNote}>
          <Repeat size={14} /> Günlük karıştırılır — yeni bir sıra için yarın tekrar gelin!
        </p>
      </div>

      <div className={styles.rightSidebar}>
        <span className={styles.counter}>
          {shuffled.length === 0 ? '0/0' : `${index + 1} / ${shuffled.length}`}
        </span>
        <div className={styles.verticalProgressBar}>
          <div
            className={styles.verticalProgressFill}
            style={{
              '--p': shuffled.length === 0 ? '0%' : `${((index + 1) / shuffled.length) * 100}%`,
            } as React.CSSProperties}
          />
        </div>
        <div className={styles.sidebarLabel}>
          <Repeat size={20} className={styles.headerIcon} />
          <h1 className={styles.headerTitle}>GÜNLÜK TEKRAR</h1>
        </div>
      </div>

    </div>
  );
};

export default ReviewMode;
