import React, { useState, useMemo } from 'react';
import { Notebook, Repeat, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Note } from '../types';
import styles from './ReviewMode.module.css';

interface ReviewModeProps {
  notes: Note[];
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

const ReviewMode: React.FC<ReviewModeProps> = ({ notes }) => {
  const shuffled = useMemo(() => seededShuffle(notes, getDaySeed()), [notes]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  if (notes.length === 0) {
    return (
      <div className={`${styles.wrapper} ${styles.emptyWrapper}`}>
        <div className="empty-state">
          <div className="empty-icon">
            <Notebook size={64} />
          </div>
          <h2 className="empty-title">Henüz not yok — öğrenmeye başlayın!</h2>
          <p className="empty-sub">
            İlk kod parçacığınızı veya kavramınızı eklemek için ekranın üstünden «+ Yeni Not» butonuna tıklayın.
          </p>
        </div>
      </div>
    );
  }

  const current = shuffled[index];

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

  const tagStyle = 'var(--accent)';

  return (
    <div className={styles.wrapper}>
      {/* Spacer to push content to middle while sidebar forces to right */}
      <div className={styles.leftSpacer}></div>

      <div className={styles.leftContent}>
        {/* Flashcard */}
        <div className={styles.scene}>
          <div
            className={`${styles.card} ${direction === 'next'
                ? styles.exitLeft
                : direction === 'prev'
                  ? styles.exitRight
                  : ''
              }`}
        >
          <span
            className={styles.cardTag}
            style={{ background: tagStyle, color: 'var(--btn-text)' }}
          >
            {current.tag || 'Genel'}
          </span>
          <h2 className={styles.cardTitle}>{current.title}</h2>
          {current.description && (
            <p className={styles.cardDesc}>{current.description}</p>
          )}
          {current.codeSnippet && (
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeDots}>
                  <span /><span /><span />
                </span>
              </div>
              <pre className={styles.code}>
                <code>{current.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
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

        <p className={`${styles.shuffleNote} with-icon`} style={{ marginTop: '0.5rem' }}>
          <Repeat size={14} /> Günlük karıştırılır — yeni bir sıra için yarın tekrar gelin!
        </p>
      </div>

      {/* Right Sidebar for Progress */}
      <div className={styles.rightSidebar}>
        <span className={styles.counter}>
          {index + 1} / {shuffled.length}
        </span>

        <div className={styles.verticalProgressBar}>
          <div
            className={styles.verticalProgressFill}
            style={{ '--p': `${((index + 1) / shuffled.length) * 100}%` } as React.CSSProperties}
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
