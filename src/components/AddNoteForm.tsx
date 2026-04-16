import React, { useState } from 'react';
import { Pencil, X, Plus, Folder } from 'lucide-react';
import type { Note, Group } from '../types';
import styles from './AddNoteForm.module.css';

interface AddNoteFormProps {
  groups: Group[];
  onAdd: (data: Omit<Note, 'id' | 'createdAt'>, groupId?: string) => void;
  onCancel: () => void;
  initialData?: Note;
}

interface FormState {
  title: string;
  description: string;
  codeSnippet: string;
  tag: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  codeSnippet: '',
  tag: '',
};

const AddNoteForm: React.FC<AddNoteFormProps> = ({ groups, onAdd, onCancel, initialData }) => {
  const [form, setForm] = useState<FormState>(
    initialData
      ? {
        title: initialData.title,
        description: initialData.description || '',
        codeSnippet: initialData.codeSnippet || '',
        tag: initialData.tag || '',
      }
      : INITIAL_STATE
  );
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.title.trim()) newErrors.title = 'Başlık zorunludur';
    if (!form.tag.trim()) newErrors.tag = 'Etiket zorunludur';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        codeSnippet: form.codeSnippet,
        tag: form.tag.trim(),
      },
      selectedGroupId || undefined
    );
    setForm(INITIAL_STATE);
    setErrors({});
    setSelectedGroupId('');
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
      >
        <div className={styles.formHeader}>
          <Pencil size={24} className={styles.formIcon} />
          <h2 className={styles.formTitle}>{initialData ? 'Notu Düzenle' : 'Yeni Not'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onCancel} aria-label="Formu kapat">
            <X size={20} />
          </button>
        </div>

        <div className={styles.formBody}>
          <div className={styles.leftCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="note-title">
                Başlık <span className={styles.required}>*</span>
              </label>
              <input
                id="note-title"
                name="title"
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                value={form.title}
                onChange={handleChange}
                placeholder="örn: LINQ GroupBy Örneği"
                autoFocus
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="note-tag">
                Etiket / Kategori <span className={styles.required}>*</span>
              </label>
              <input
                id="note-tag"
                name="tag"
                type="text"
                className={`${styles.input} ${errors.tag ? styles.inputError : ''}`}
                value={form.tag}
                onChange={handleChange}
                placeholder="örn: C#, React, Docker..."
              />
              {errors.tag && <span className={styles.error}>{errors.tag}</span>}
              <div className={styles.tagSuggestions}>
                {['C#', 'ASP.NET', 'EF Core', 'React', 'TypeScript', 'Docker', 'Python'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.tagChip} ${form.tag === t ? styles.tagChipActive : ''}`}
                    onClick={() => setForm((p) => ({ ...p, tag: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {!initialData && groups.length > 0 && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="note-group">
                  <Folder size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Gruba Ekle <span className={styles.optional}>(isteğe bağlı)</span>
                </label>
                <select
                  id="note-group"
                  className={styles.select}
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                  <option value="">— Grup seçme —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.noteIds.length} not)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.rightCol}>
            <div className={`${styles.field} ${styles.codeField}`}>
              <label className={styles.label} htmlFor="note-code">
                Kod Parçacığı
              </label>
          <textarea
            id="note-code"
            name="codeSnippet"
            className={styles.codeTextarea}
            value={form.codeSnippet}
            onChange={handleChange}
            placeholder={'// kodunuzu buraya yapıştırın\nconsole.log("Merhaba, SarıDefter!");'}
            rows={6}
            spellCheck={false}
          />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            İptal
          </button>
          <button type="submit" className={`${styles.submitBtn} with-icon`}>
            {initialData ? <Pencil size={18} /> : <Plus size={18} />}
            {initialData ? 'Güncelle' : 'Notu Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNoteForm;
