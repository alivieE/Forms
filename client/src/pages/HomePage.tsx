import React from 'react';
import { Link } from 'react-router-dom';
import { useGetFormsQuery } from '../store/api';
import { Form } from '../types';

const s = {
  page:  { flex: 1, padding: '48px 0 80px' } as React.CSSProperties,
  wrap:  { maxWidth: 860, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  btn:   { display: 'inline-block', padding: '11px 24px', background: '#6c63ff', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' } as React.CSSProperties,
  card:  { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: '18px 22px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  badge: { background: '#ede9ff', color: '#6c63ff', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999 } as React.CSSProperties,
  error: { background: '#fce8e6', color: '#d93025', padding: '12px 16px', borderRadius: 8, marginBottom: 16 } as React.CSSProperties,
};

function FormCard({ form }: { form: Form }) {
  return (
    <div style={s.card}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{form.title}</h3>
        {form.description && <p style={{ color: '#5f6368', fontSize: 13, margin: '0 0 8px' }}>{form.description}</p>}
        <span style={s.badge}>{form.questions.length} questions</span>
      </div>
      {/* "View Form" as per spec */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/forms/${form.id}/fill`} style={{ padding: '7px 16px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          View Form
        </Link>
        <Link to={`/forms/${form.id}/responses`} style={{ padding: '7px 16px', border: '1.5px solid #e0e0e0', color: '#5f6368', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
          View Responses
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: forms, isLoading, isError } = useGetFormsQuery();

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>
            My <span style={{ color: '#6c63ff' }}>Forms</span>
          </h1>
          <p style={{ fontSize: 16, color: '#5f6368', marginBottom: 24 }}>Create forms, collect responses.</p>
          <Link to="/forms/new" style={s.btn}>+ Create New Form</Link>
        </div>

        {isLoading && <p style={{ color: '#5f6368' }}>Loading...</p>}
        {isError   && <div style={s.error}>⚠️ Failed to load forms. Is the server running?</div>}

        {!isLoading && !isError && forms?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9aa0a6' }}>
            <div style={{ fontSize: 52 }}>📭</div>
            <p style={{ marginTop: 12 }}>No forms yet</p>
          </div>
        )}

        {forms?.map((form) => <FormCard key={form.id} form={form} />)}
      </div>
    </main>
  );
}
