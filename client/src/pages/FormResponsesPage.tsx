import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetFormQuery, useGetResponsesQuery } from '../store/api';

const s = {
  page:  { flex: 1, padding: '48px 0 80px' } as React.CSSProperties,
  wrap:  { maxWidth: 760, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  card:  { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  error: { background: '#fce8e6', color: '#d93025', padding: '10px 14px', borderRadius: 8, marginBottom: 14 } as React.CSSProperties,
  badge: { background: '#ede9ff', color: '#6c63ff', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999 } as React.CSSProperties,
  btnGh: { padding: '7px 16px', border: '1.5px solid #e0e0e0', color: '#5f6368', borderRadius: 8, fontSize: 13, background: '#fff', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
  btn:   { padding: '7px 16px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
};

export default function FormResponsesPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: form }      = useGetFormQuery(id);
  const { data: responses, isLoading, isError } = useGetResponsesQuery(id);

  const qMap = Object.fromEntries((form?.questions ?? []).map((q) => [q.id, q.text]));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <main style={s.page}>
      <div style={s.wrap}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 700 }}>Responses</h2>
            <p style={{ color: '#5f6368', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {form?.title}
              <span style={s.badge}>{responses?.length ?? 0}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/forms/${id}/fill`} style={s.btnGh}>View Form</Link>
            <Link to="/" style={s.btnGh}>← Back</Link>
          </div>
        </div>

        {isLoading && <p style={{ color: '#5f6368' }}>Loading...</p>}
        {isError   && <div style={s.error}>⚠️ Failed to load responses</div>}

        {!isLoading && responses?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9aa0a6' }}>
            <div style={{ fontSize: 52 }}>📭</div>
            <p style={{ marginTop: 12, marginBottom: 20 }}>No responses yet</p>
            <Link to={`/forms/${id}/fill`} style={s.btn}>Fill Out Form</Link>
          </div>
        )}

        {responses?.map((resp, idx) => (
          <div key={resp.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 22px', background: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
              <strong style={{ fontSize: 14 }}>Response #{idx + 1}</strong>
              <span style={{ fontSize: 12, color: '#9aa0a6' }}>{formatDate(resp.submittedAt)}</span>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {resp.answers.map((ans) => (
                <div key={ans.questionId}>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368', marginBottom: 4 }}>
                    {qMap[ans.questionId] ?? ans.questionId}
                  </p>
                  <p style={{ background: '#f5f5f5', padding: '7px 12px', borderRadius: 6, fontSize: 14, margin: 0 }}>
                    {ans.value.length > 0
                      ? ans.value.join(', ')
                      : <em style={{ color: '#9aa0a6' }}>No answer</em>
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}
