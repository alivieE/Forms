import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetFormQuery, useSubmitResponseMutation } from '../store/api';
import { AnswerInput, Question } from '../types';

const s = {
  page:  { flex: 1, padding: '48px 0 80px' } as React.CSSProperties,
  wrap:  { maxWidth: 680, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  card:  { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 22, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  btn:   { padding: '10px 24px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
  btnGh: { padding: '10px 22px', border: '1.5px solid #e0e0e0', color: '#5f6368', borderRadius: 8, fontSize: 14, background: '#fff' } as React.CSSProperties,
  opt:   (sel: boolean) => ({ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 14px', border: `1.5px solid ${sel ? '#6c63ff' : '#e0e0e0'}`, borderRadius: 8, marginBottom: 8, cursor: 'pointer', background: sel ? '#ede9ff' : '#fff', fontSize: 14 } as React.CSSProperties),
  error: { background: '#fce8e6', color: '#d93025', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 } as React.CSSProperties,
};

function QuestionField({ question, value, onChange }: {
  question: Question;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: 12 }}>
        {question.text}
        {question.required && <span style={{ color: '#d93025' }}> *</span>}
      </p>

      {question.type === 'TEXT' && (
        <input style={s.input} value={value[0] ?? ''} onChange={(e) => onChange([e.target.value])} placeholder="Your answer..." />
      )}

      {question.type === 'DATE' && (
        <input type="date" style={s.input} value={value[0] ?? ''} onChange={(e) => onChange([e.target.value])} />
      )}

      {question.type === 'MULTIPLE_CHOICE' && question.options.map((opt) => (
        <label key={opt} style={s.opt(value[0] === opt)}>
          <input type="radio" name={question.id} checked={value[0] === opt} onChange={() => onChange([opt])} />
          {opt}
        </label>
      ))}

      {question.type === 'CHECKBOX' && question.options.map((opt) => (
        <label key={opt} style={s.opt(value.includes(opt))}>
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={(e) => onChange(e.target.checked ? [...value, opt] : value.filter((v) => v !== opt))}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function FormFillerPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: form, isLoading, isError } = useGetFormQuery(id);
  const [submitResponse, { isLoading: submitting }] = useSubmitResponseMutation();

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    for (const q of form.questions) {
      if (!q.required) continue;
      const val = answers[q.id] ?? [];
      if (val.length === 0 || val[0] === '') {
        setError(`Please fill in required field: "${q.text}"`);
        return;
      }
    }
    setError(null);
    try {
      const answersList: AnswerInput[] = form.questions.map((q) => ({
        questionId: q.id,
        value: answers[q.id] ?? [],
      }));
      await submitResponse({ formId: id, answers: answersList }).unwrap();
      setDone(true);
    } catch {
      setError('Submission failed. Please try again.');
    }
  };

  if (isLoading) return <main style={s.page}><div style={s.wrap}><p>Loading...</p></div></main>;
  if (isError || !form) return <main style={s.page}><div style={s.wrap}><div style={s.error}>⚠️ Form not found</div></div></main>;

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <main style={s.page}>
        <div style={{ ...s.wrap, textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 64 }}>✅</div>
          <h2 style={{ margin: '16px 0 8px' }}>Form submitted successfully!</h2>
          <p style={{ color: '#5f6368', marginBottom: 28 }}>Thank you for filling out <strong>{form.title}</strong>.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={s.btnGh} onClick={() => navigate('/')}>Back to Home</button>
            <Link to={`/forms/${id}/responses`} style={s.btn}>View Responses</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <div style={{ ...s.card, borderTop: '5px solid #6c63ff', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 24 }}>{form.title}</h2>
          {form.description && <p style={{ color: '#5f6368', margin: 0 }}>{form.description}</p>}
        </div>

        {error && <div style={s.error}>{error}</div>}

        {form.questions.map((q) => (
          <div key={q.id} style={s.card}>
            <QuestionField question={q} value={answers[q.id] ?? []} onChange={(val) => handleAnswer(q.id, val)} />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={s.btnGh} onClick={() => navigate('/')}>Cancel</button>
          <button style={s.btn as React.CSSProperties} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </main>
  );
}
