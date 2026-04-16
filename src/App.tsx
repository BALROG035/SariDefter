import React, { useState, useEffect, useRef } from 'react';
import {
  BookMarked, List, RefreshCw, Sun, Moon, Search, Plus, NotebookPen,
  X, Pencil, Download, Upload, CheckCircle, AlertTriangle,
  Trash2, Check, Tag, Folder, ChevronDown, ChevronRight,
} from 'lucide-react';
import type { View, Note } from './types';
import { useNotes } from './hooks/useNotes';
import { useGroups } from './hooks/useGroups';
import NoteCard from './components/NoteCard';
import AddNoteForm from './components/AddNoteForm';
import ReviewMode from './components/ReviewMode';
import './App.css';

type ImportStage = 'idle' | 'confirm' | 'success' | 'error';

const App: React.FC = () => {
  const { notes, addNote, deleteNote, updateNote, exportNotes, importNotes, toggleHidden } = useNotes();
  const { groups, addGroup, deleteGroup, renameGroup, toggleNoteInGroup, removeNoteFromAllGroups } = useGroups();

  const [view, setView] = useState<View>('feed');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarTagFilter, setSidebarTagFilter] = useState<string | null>(null);

  const [importStage, setImportStage] = useState<ImportStage>('idle');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [createGroupName, setCreateGroupName] = useState('');
  const [createGroupSelectedNotes, setCreateGroupSelectedNotes] = useState<Set<string>>(new Set());

  const [groupModalNoteId, setGroupModalNoteId] = useState<string | null>(null);
  const [inlineGroupName, setInlineGroupName] = useState('');

  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    removeNoteFromAllGroups(id);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportStage('confirm');
    e.target.value = '';
  };

  const handleImport = async (mode: 'merge' | 'replace') => {
    if (!importFile) return;
    try {
      const count = await importNotes(importFile, mode);
      setImportMessage(`${count} not başarıyla ${mode === 'replace' ? 'yüklendi' : 'eklendi'}.`);
      setImportStage('success');
    } catch (err) {
      setImportMessage((err as Error).message ?? 'Bilinmeyen hata');
      setImportStage('error');
    }
  };

  const closeImportModal = () => {
    setImportStage('idle');
    setImportFile(null);
    setImportMessage('');
  };

  const openCreateGroup = () => {
    setCreateGroupName('');
    setCreateGroupSelectedNotes(new Set());
    setShowCreateGroup(true);
  };

  const handleConfirmCreateGroup = () => {
    if (!createGroupName.trim()) return;
    const id = addGroup(createGroupName.trim());
    createGroupSelectedNotes.forEach((noteId) => toggleNoteInGroup(id, noteId));
    setShowCreateGroup(false);
    setCreateGroupName('');
    setCreateGroupSelectedNotes(new Set());
  };

  const toggleCreateGroupNote = (noteId: string) => {
    setCreateGroupSelectedNotes((prev) => {
      const next = new Set(prev);
      next.has(noteId) ? next.delete(noteId) : next.add(noteId);
      return next;
    });
  };

  const groupModalNote = groupModalNoteId ? notes.find((n) => n.id === groupModalNoteId) : null;

  const handleCreateGroupInModal = () => {
    if (!inlineGroupName.trim() || !groupModalNoteId) return;
    const id = addGroup(inlineGroupName.trim());
    toggleNoteInGroup(id, groupModalNoteId);
    setInlineGroupName('');
  };

  const allTags = Array.from(new Set(notes.map((n) => n.tag || 'Genel'))).sort();

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      n.tag.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q);
    const matchesTag = sidebarTagFilter ? (n.tag || 'Genel') === sidebarTagFilter : true;
    return matchesSearch && matchesTag;
  });

  const handleRenameConfirm = () => {
    if (renamingGroupId && renameValue.trim()) renameGroup(renamingGroupId, renameValue.trim());
    setRenamingGroupId(null);
    setRenameValue('');
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileSelected}
            aria-label="JSON dosyası seç"
          />
          <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Notları İçe Aktar (.json)">
            <Upload size={18} />
          </button>
          <button className="icon-btn" onClick={exportNotes} title="Notları Dışa Aktar (.json)" disabled={notes.length === 0}>
            <Download size={18} />
          </button>
          <button className="icon-btn" onClick={() => setDarkMode((d) => !d)} title={darkMode ? 'Açık tema' : 'Koyu tema'}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="add-btn with-icon" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Yeni Not
          </button>
        </div>
      </header>

      {view === 'feed' ? (
        <div className="feed-layout">
          <aside className="feed-sidebar">
            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{notes.length}</span>
                <span className="sidebar-stat-label">Not</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{allTags.length}</span>
                <span className="sidebar-stat-label">Etiket</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-num">{groups.length}</span>
                <span className="sidebar-stat-label">Grup</span>
              </div>
            </div>

            <div className="sidebar-section">
              <button className="sidebar-section-header" onClick={() => setTagsExpanded((v) => !v)}>
                <span className="sidebar-section-title with-icon">
                  <Tag size={14} /> Etiketler
                </span>
                {tagsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {tagsExpanded && (
                <div className="sidebar-items">
                  <button
                    className={`sidebar-tag-item ${sidebarTagFilter === null ? 'sidebar-tag-item--active' : ''}`}
                    onClick={() => setSidebarTagFilter(null)}
                  >
                    <span className="sidebar-tag-dot" style={{ background: 'var(--accent)' }} />
                    Tümü
                    <span className="sidebar-tag-count">{notes.length}</span>
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`sidebar-tag-item ${sidebarTagFilter === tag ? 'sidebar-tag-item--active' : ''}`}
                      onClick={() => setSidebarTagFilter(sidebarTagFilter === tag ? null : tag)}
                    >
                      <span className="sidebar-tag-dot" />
                      {tag}
                      <span className="sidebar-tag-count">
                        {notes.filter((n) => (n.tag || 'Genel') === tag).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-header-row">
                <button className="sidebar-section-header" onClick={() => setGroupsExpanded((v) => !v)}>
                  <span className="sidebar-section-title with-icon">
                    <Folder size={14} /> Gruplar
                  </span>
                  {groupsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <button
                  className="sidebar-create-group-btn with-icon"
                  onClick={openCreateGroup}
                  title="Yeni Grup Oluştur"
                >
                  <Plus size={13} /> Yeni
                </button>
              </div>
              {groupsExpanded && (
                <div className="sidebar-items">
                  {groups.length === 0 && (
                    <p className="sidebar-empty">Henüz grup yok.</p>
                  )}
                  {groups.map((g) => (
                    <div key={g.id} className="sidebar-group-item">
                      {renamingGroupId === g.id ? (
                        <input
                          className="sidebar-rename-input"
                          value={renameValue}
                          autoFocus
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameConfirm();
                            if (e.key === 'Escape') setRenamingGroupId(null);
                          }}
                          onBlur={handleRenameConfirm}
                          maxLength={40}
                        />
                      ) : (
                        <button
                          className="sidebar-group-name"
                          onClick={() => { setRenamingGroupId(g.id); setRenameValue(g.name); }}
                          title="Yeniden adlandır"
                        >
                          {g.name}
                        </button>
                      )}
                      <span className="sidebar-tag-count">{g.noteIds.length}</span>
                      <button
                        className="sidebar-group-delete"
                        onClick={() => deleteGroup(g.id)}
                        title="Grubu sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <main className="feed-main">
            <div className="search-row">
              <div className="search-wrap">
                <Search className="search-icon" size={18} color="var(--text-muted)" />
                <input
                  className="search-input"
                  type="search"
                  placeholder="Başlığa, etikete veya açıklamaya göre ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Notlarda ara"
                />
              </div>
              <button className="add-btn-mobile" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Yeni
              </button>
            </div>

            {sidebarTagFilter && (
              <div className="active-filter-bar">
                <Tag size={14} />
                <span><strong>{sidebarTagFilter}</strong> etiketi filtreleniyor</span>
                <button className="filter-clear-btn" onClick={() => setSidebarTagFilter(null)}>
                  <X size={14} />
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {notes.length === 0 ? <NotebookPen size={64} /> : <Search size={64} />}
                </div>
                <h2 className="empty-title">
                  {notes.length === 0 ? 'Henüz not yok — öğrenmeye başlayın!' : 'Sonuç bulunamadı'}
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
                    groups={groups}
                    onDelete={handleDeleteNote}
                    onEdit={(n) => setEditingNote(n)}
                    onView={(n) => setViewingNote(n)}
                    onToggleHidden={toggleHidden}
                    onManageGroups={(noteId) => setGroupModalNoteId(noteId)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      ) : (
        <ReviewMode notes={notes} groups={groups} />
      )}

      {(showForm || editingNote) && (
        <AddNoteForm
          groups={groups}
          onAdd={(data, groupId) => {
            if (editingNote) {
              updateNote(editingNote.id, data);
              setEditingNote(null);
            } else {
              const newId = addNote(data);
              if (groupId) toggleNoteInGroup(groupId, newId);
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

      {viewingNote && (
        <div className="view-note-overlay" onClick={() => setViewingNote(null)}>
          <div className="view-note-modal" onClick={(e) => e.stopPropagation()}>
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
                    <div className="code-dots"><span /><span /><span /></div>
                    <span>{viewingNote.tag}</span>
                  </div>
                  <pre className="view-note-code">
                    <code>{viewingNote.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
            <div className="view-note-actions">
              <button
                className="view-note-btn view-note-btn-edit with-icon"
                onClick={() => { setEditingNote(viewingNote); setViewingNote(null); }}
              >
                <Pencil size={16} /> Düzenle
              </button>
              <button className="view-note-btn view-note-btn-close" onClick={() => setViewingNote(null)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {importStage !== 'idle' && (
        <div className="import-overlay" onClick={closeImportModal}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            {importStage === 'confirm' && (
              <>
                <div className="import-modal-icon"><Upload size={36} /></div>
                <h2 className="import-modal-title">Notları İçe Aktar</h2>
                <p className="import-modal-file">{importFile?.name}</p>
                <p className="import-modal-desc">Mevcut notlarınızla nasıl işlem yapmak istersiniz?</p>
                <div className="import-modal-actions">
                  <button className="import-btn import-btn-merge with-icon" onClick={() => handleImport('merge')}>
                    <Plus size={16} /> Mevcut Notlara Ekle
                  </button>
                  <button className="import-btn import-btn-replace with-icon" onClick={() => handleImport('replace')}>
                    <AlertTriangle size={16} /> Tümünü Değiştir
                  </button>
                </div>
                <button className="import-cancel" onClick={closeImportModal}>İptal</button>
              </>
            )}
            {importStage === 'success' && (
              <>
                <div className="import-modal-icon import-modal-icon--success"><CheckCircle size={40} /></div>
                <h2 className="import-modal-title">Başarılı!</h2>
                <p className="import-modal-desc">{importMessage}</p>
                <button className="import-btn import-btn-merge" onClick={closeImportModal}>Tamam</button>
              </>
            )}
            {importStage === 'error' && (
              <>
                <div className="import-modal-icon import-modal-icon--error"><AlertTriangle size={40} /></div>
                <h2 className="import-modal-title">Hata</h2>
                <p className="import-modal-desc">{importMessage}</p>
                <button className="import-btn import-btn-replace" onClick={closeImportModal}>Kapat</button>
              </>
            )}
          </div>
        </div>
      )}

      {showCreateGroup && (
        <div className="gm-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="gm-modal gm-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="gm-header">
              <div>
                <h2 className="gm-title">Yeni Grup Oluştur</h2>
                <p className="gm-subtitle">Grup adını girin, ardından notları seçin</p>
              </div>
              <button className="gm-close" onClick={() => setShowCreateGroup(false)}><X size={20} /></button>
            </div>

            <div className="gm-name-row">
              <input
                className="gm-input"
                type="text"
                placeholder="Grup adı..."
                value={createGroupName}
                onChange={(e) => setCreateGroupName(e.target.value)}
                autoFocus
                maxLength={40}
              />
            </div>

            <p className="gm-pick-label">Bu gruba eklenecek notlar:</p>
            <div className="gm-list gm-note-pick-list">
              {notes.length === 0 && <p className="gm-empty">Henüz not eklenmedi.</p>}
              {notes.map((n) => {
                const selected = createGroupSelectedNotes.has(n.id);
                return (
                  <button
                    key={n.id}
                    className={`gm-pick-item ${selected ? 'gm-pick-item--active' : ''}`}
                    onClick={() => toggleCreateGroupNote(n.id)}
                  >
                    <span className="gm-pick-tag">{n.tag || 'Genel'}</span>
                    <span className="gm-pick-title">{n.title}</span>
                    {selected && <Check size={15} className="gm-item-check" />}
                  </button>
                );
              })}
            </div>

            <div className="gm-create">
              <span className="gm-selected-count">
                {createGroupSelectedNotes.size} not seçildi
              </span>
              <button
                className="gm-create-btn with-icon"
                onClick={handleConfirmCreateGroup}
                disabled={!createGroupName.trim()}
              >
                <Folder size={16} /> Grubu Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {groupModalNoteId && groupModalNote && (
        <div className="gm-overlay" onClick={() => setGroupModalNoteId(null)}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gm-header">
              <div>
                <h2 className="gm-title">Gruba Ekle</h2>
                <p className="gm-subtitle">{groupModalNote.title}</p>
              </div>
              <button className="gm-close" onClick={() => setGroupModalNoteId(null)}><X size={20} /></button>
            </div>
            <div className="gm-list">
              {groups.length === 0 && <p className="gm-empty">Henüz grup yok. Aşağıdan oluşturun.</p>}
              {groups.map((g) => {
                const inGroup = g.noteIds.includes(groupModalNoteId);
                return (
                  <button
                    key={g.id}
                    className={`gm-item ${inGroup ? 'gm-item-active' : ''}`}
                    onClick={() => toggleNoteInGroup(g.id, groupModalNoteId)}
                  >
                    <span className="gm-item-name">{g.name}</span>
                    <span className="gm-item-count">{g.noteIds.length} not</span>
                    {inGroup && <Check size={16} className="gm-item-check" />}
                  </button>
                );
              })}
            </div>
            <div className="gm-create">
              <input
                className="gm-input"
                type="text"
                placeholder="Yeni grup adı..."
                value={inlineGroupName}
                onChange={(e) => setInlineGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroupInModal()}
                maxLength={40}
              />
              <button
                className="gm-create-btn with-icon"
                onClick={handleCreateGroupInModal}
                disabled={!inlineGroupName.trim()}
              >
                <Plus size={16} /> Oluştur ve Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
