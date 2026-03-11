import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFormMutation } from '../store/api';
import { QuestionDraft, QuestionType } from '../types';

const s = {
  page:  { flex: 1, padding: '48px 0 80px' } as React.CSSProperties,
  wrap:  { maxWidth: 700, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  card:  { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 22, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5f6368', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  btn:   { padding: '10px 22px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14 } as React.CSSProperties,
  btnGh: { padding: '10px 22px', border: '1.5px solid #e0e0e0', color: '#5f6368', borderRadius: 8, fontSize: 14, background: '#fff' } as React.CSSProperties,
  btnSm: { padding: '5px 12px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 13, background: '#fff', color: '#5f6368' } as React.CSSProperties,
  btnDg: { padding: '5px 12px', background: '#fce8e6', color: '#d93025', borderRadius: 6, fontSize: 13 } as React.CSSProperties,
  btnIcon: { padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 14, background: '#fff', color: '#5f6368', lineHeight: 1 } as React.CSSProperties,
  error: { background: '#fce8e6', color: '#d93025', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 } as React.CSSProperties,
  badge: { background: '#ede9ff', color: '#6c63ff', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999 } as React.CSSProperties,
};

export default function FormBuilderPage() {
  const navigate = useNavigate();
  const [createForm, { isLoading }] = useCreateFormMutation();

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions]     = useState<QuestionDraft[]>([]);
  const [error, setError]             = useState<string | null>(null);

  // ── Question helpers ────────────────────────────────────────────────────────
  const addQuestion = () => {
    setQuestions([...questions, {
      _localId: String(Date.now()),
      text: '', type: 'TEXT', options: [], required: false,
    }]);
  };

  const updateQ = (localId: string, patch: Partial<QuestionDraft>) => {
    setQuestions(questions.map((q) => q._localId === localId ? { ...q, ...patch } : q));
  };

  const removeQ = (localId: string) => {
    setQuestions(questions.filter((q) => q._localId !== localId));
  };

  // ── Move question up/down (visual arrangement) ────────────────────────────
  const moveQ = (localId: string, dir: 'up' | 'down') => {
    const idx = questions.findIndex((q) => q._localId === localId);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === questions.length - 1) return;
    const next = [...questions];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setQuestions(next);
  };

  const handleTypeChange = (localId: string, type: QuestionType) => {
    const needsOptions = type === 'MULTIPLE_CHOICE' || type === 'CHECKBOX';
    updateQ(localId, { type, options: needsOptions ? ['Option 1'] : [] });
  };

  const addOption = (localId: string) => {
    const q = questions.find((q) => q._localId === localId)!;
    updateQ(localId, { options: [...q.options, `Option ${q.options.length + 1}`] });
  };

  const updateOption = (localId: string, idx: number, value: string) => {
    const q = questions.find((q) => q._localId === localId)!;
    const options = [...q.options];
    options[idx] = value;
    updateQ(localId, { options });
  };

  const removeOption = (localId: string, idx: number) => {
    const q = questions.find((q) => q._localId === localId)!;
    updateQ(localId, { options: q.options.filter((_, i) => i !== idx) });
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim())     { setError('Please enter a form title'); return; }
    if (!questions.length) { setError('Please add at least one question'); return; }
    setError(null);
    try {
      const qs = questions.map(({ _localId, ...q }) => q);
      const result = await createForm({ title, description, questions: qs }).unwrap();
      navigate(`/forms/${result.id}/fill`);
    } catch {
      setError('Failed to save form. Is the server running?');
    }
  };

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <h2 style={{ marginBottom: 24, fontSize: 30, fontWeight: 700 }}>Create New Form</h2>

        {error && <div style={s.error}>{error}</div>}

        {/* Title & Description */}
        <div style={s.card}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Title *</label>
            <input style={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Form title" />
          </div>
          <div>
            <label style={s.label}>Description</label>
            <input style={s.input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, idx) => (
          <div key={q._localId} style={s.card}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={s.badge}>Question {idx + 1}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Move up/down buttons — visual arrangement */}
                <button style={s.btnIcon} onClick={() => moveQ(q._localId, 'up')}   disabled={idx === 0}                    title="Move up">↑</button>
                <button style={s.btnIcon} onClick={() => moveQ(q._localId, 'down')} disabled={idx === questions.length - 1} title="Move down">↓</button>
                <button style={s.btnDg}   onClick={() => removeQ(q._localId)}>✕ Remove</button>
              </div>
            </div>

            {/* Question text */}
            <div style={{ marginBottom: 10 }}>
              <label style={s.label}>Question Text</label>
              <input
                style={s.input}
                value={q.text}
                onChange={(e) => updateQ(q._localId, { text: e.target.value })}
                placeholder="Enter question..."
              />
            </div>

            {/* Type */}
            <div style={{ marginBottom: 10 }}>
              <label style={s.label}>Type</label>
              <select
                style={{ ...s.input, cursor: 'pointer' }}
                value={q.type}
                onChange={(e) => handleTypeChange(q._localId, e.target.value as QuestionType)}
              >
                <option value="TEXT">Text Input</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="CHECKBOX">Checkboxes</option>
                <option value="DATE">Date</option>
              </select>
            </div>

            {/* Required */}
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, marginBottom: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={q.required} onChange={() => updateQ(q._localId, { required: !q.required })} />
              Required
            </label>

            {/* Options */}
            {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') && (
              <div>
                <label style={s.label}>Options</label>
                {q.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      style={s.input}
                      value={opt}
                      onChange={(e) => updateOption(q._localId, i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                    />
                    {q.options.length > 1 && (
                      <button style={s.btnDg} onClick={() => removeOption(q._localId, i)}>✕</button>
                    )}
                  </div>
                ))}
                <button style={s.btnSm} onClick={() => addOption(q._localId)}>+ Add Option</button>
              </div>
            )}
          </div>
        ))}

        <button style={{ ...s.btnGh, width: '100%', marginBottom: 16 }} onClick={addQuestion}>
          + Add Question
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.btnGh} onClick={() => navigate('/')}>Cancel</button>
          <button style={s.btn} onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>
    </main>
  );
}
