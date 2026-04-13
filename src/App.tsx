import React, { useState, useEffect } from 'react';
import { BookMarked, List, RefreshCw, Sun, Moon, Search, Plus, NotebookPen, X, Pencil } from 'lucide-react';
import type { View, Note } from './types';
import { useNotes } from './hooks/useNotes';
import NoteCard from './components/NoteCard';
import AddNoteForm from './components/AddNoteForm';
import ReviewMode from './components/ReviewMode';
import './App.css';

const App: React.FC = () => {
  const { notes, addNote, deleteNote, updateNote } = useNotes();
  const [view, setView] = useState<View>('feed');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.tag.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo"><BookMarked size={28} /></span>
          <span className="navbar-title">Sarı<span className="accent-text">Defter</span></span>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-btn ${view === 'feed' ? 'nav-btn-active' : ''} with-icon`}
            onClick={() => setView('feed')}
          >
            <List size={18} /> Akış
          </button>
          <button
            className={`nav-btn ${view === 'review' ? 'nav-btn-active' : ''} with-icon`}
            onClick={() => setView('review')}
          >
            <RefreshCw size={18} /> Tekrar
          </button>
        </nav>

        <div className="navbar-actions">
          <button
            className="icon-btn"
            onClick={() => setDarkMode((d) => !d)}
            title={darkMode ? 'Açık tema' : 'Koyu tema'}
            aria-label="Karanlık modu değiştir"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="add-btn with-icon" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Yeni Not
          </button>
        </div>
      </header>

      {view === 'feed' ? (
      <main className="main">
        <section className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              Kişisel <span className="accent-text">Öğrenme Günlüğünüz</span>
            </h1>
            <p className="hero-sub">
              Kod parçacıklarını, kavramları ve öğrendiklerinizi kaydedin — her defasında bir not.
            </p>
          </div>
          <div className="stats-row">
            <div className="stat-pill">
              <span className="stat-num">{notes.length}</span>
              <span className="stat-label">Notlar</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">
                {new Set(notes.map((n) => n.tag)).size}
              </span>
              <span className="stat-label">Konular</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">
                {
                  notes.filter((n) => {
                    const d = new Date(n.createdAt);
                    const today = new Date();
                    return d.toDateString() === today.toDateString();
                  }).length
                }
              </span>
              <span className="stat-label">Bugün</span>
            </div>
          </div>
        </section>

        <div className="search-row">
          <div className="search-wrap">
            <Search className="search-icon" size={18} color="var(--text-muted)" />
            <input
              className="search-input"
              type="search"
              placeholder="Notları başlığa, etikete veya açıklamaya göre arayın..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Notlarda ara"
            />
          </div>
          <button className="add-btn-mobile" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Yeni
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {notes.length === 0 ? <NotebookPen size={64} /> : <Search size={64} />}
            </div>
            <h2 className="empty-title">
              {notes.length === 0
                ? 'Henüz not yok — öğrenmeye başlayın!'
                : 'Sonuç bulunamadı'}
            </h2>
            <p className="empty-sub">
              {notes.length === 0
                ? 'İlk kod parçacığınızı veya kavramınızı eklemek için «+ Yeni Not» butonuna tıklayın.'
                : 'Farklı bir arama terimi deneyin.'}
            </p>
            {notes.length === 0 && (
              <button className="add-btn with-icon" onClick={() => setShowForm(true)}>
                <Plus size={18} /> İlk Notu Ekle
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filtered.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={deleteNote} 
                onEdit={(n) => setEditingNote(n)}
                onView={(n) => setViewingNote(n)}
              />
            ))}
          </div>
        )}
      </main>
      ) : (
        <ReviewMode notes={notes} />
      )}

      {(showForm || editingNote) && (
        <AddNoteForm
          onAdd={(data) => {
            if (editingNote) {
              updateNote(editingNote.id, data);
              setEditingNote(null);
            } else {
              addNote(data);
              setShowForm(false);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
          initialData={editingNote || undefined}
        />
      )}

      {/* ── View Note Modal ── */}
      {viewingNote && (
        <div className="view-note-overlay" onClick={() => setViewingNote(null)}>
          <div className="view-note-modal" onClick={e => e.stopPropagation()}>
            <div className="view-note-header">
              <span className="view-note-tag">{viewingNote.tag}</span>
              <button className="view-note-close" onClick={() => setViewingNote(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="view-note-content">
              <h2 className="view-note-title">{viewingNote.title}</h2>
              {viewingNote.description && <p className="view-note-desc">{viewingNote.description}</p>}
              {viewingNote.codeSnippet && (
                <div className="view-note-code-wrapper">
                  <div className="view-note-code-header">
                    <div className="code-dots"><span/><span/><span/></div>
                    <span>{viewingNote.tag}</span>
                  </div>
                  <pre className="view-note-code">
                    <code>{viewingNote.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
            <div className="view-note-actions">
               <button className="view-note-btn view-note-btn-edit with-icon" onClick={() => { setEditingNote(viewingNote); setViewingNote(null); }}>
                  <Pencil size={16} /> Düzenle
               </button>
               <button className="view-note-btn view-note-btn-close" onClick={() => setViewingNote(null)}>
                  Kapat
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
