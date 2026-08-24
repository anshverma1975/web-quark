import React, { useEffect, useMemo, useState, useCallback } from 'react';
import './App.css';
import QdLogo from './components/QdLogo';
import { samples } from './lib/samples';
import { compile, splitSlides } from './lib/quarkdown';
import {
  FileText, Files, Play, Pause, Download, Copy, Check,
  ChevronLeft, ChevronRight, PanelLeft, PanelRight, Github, Sparkles,
} from 'lucide-react';

const DOCTYPES = [
  { id: 'plain',  label: 'plain'  },
  { id: 'paged',  label: 'paged'  },
  { id: 'slides', label: 'slides' },
  { id: 'docs',   label: 'docs'   },
];

const STORAGE_KEY = 'qd_docs_v2';

function loadDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return samples.map(s => ({ ...s }));
}

function saveDocs(docs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); } catch (e) { /* ignore */ }
}

export default function App() {
  const [docs, setDocs] = useState(loadDocs);
  const [activeId, setActiveId] = useState(docs[0]?.id || 'welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const active = docs.find(d => d.id === activeId) || docs[0];

  useEffect(() => { saveDocs(docs); }, [docs]);
  useEffect(() => { setSlideIdx(0); }, [activeId]);

  const compiled = useMemo(() => {
    if (!active) return { html: '', meta: {}, headings: [] };
    return compile(active.content);
  }, [active]);

  const effectiveDoctype = compiled.meta.doctype || active?.doctype || 'plain';

  const updateContent = (val) => {
    setDocs(prev => prev.map(d => d.id === activeId ? { ...d, content: val } : d));
  };

  const setDoctype = (dt) => {
    setDocs(prev => prev.map(d => d.id === activeId ? { ...d, doctype: dt } : d));
  };

  const addNewDoc = () => {
    const id = 'doc-' + Date.now();
    const next = { id, name: 'Untitled', doctype: 'plain', content: '.doctitle {Untitled}\n\n# Untitled\n\nStart writing...\n' };
    setDocs(prev => [...prev, next]);
    setActiveId(id);
  };

  const renameDoc = (id, name) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const deleteDoc = (id) => {
    setDocs(prev => {
      const filtered = prev.filter(d => d.id !== id);
      if (filtered.length === 0) return samples.map(s => ({ ...s }));
      return filtered;
    });
    if (activeId === id) setActiveId(docs[0]?.id || 'welcome');
  };

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(compiled.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { /* ignore */ }
  }, [compiled.html]);

  const downloadHtml = () => {
    const title = compiled.meta.title || active?.name || 'quarkdown';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Fraunces,Georgia,serif;max-width:820px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6}pre,code{font-family:'JetBrains Mono',monospace;background:#f4f4f0;padding:2px 6px;border-radius:4px}pre{padding:16px}blockquote{border-left:4px solid #a7c3b6;margin:0;padding:8px 16px;color:#555}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}.qd-abstract{border:1px solid #ddd;padding:16px;border-radius:8px;margin:16px 0}.qd-abstract-label{font-weight:700;text-align:center;margin-bottom:8px}.qd-box{border-radius:8px;padding:12px 16px;margin:12px 0;background:#f4f7f4;border:1px solid #cfe0d5}.qd-center{text-align:center}.qd-row{display:flex;gap:16px}</style></head><body>${compiled.html}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const title = compiled.meta.title || 'quarkdown';
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>@page{margin:1in}body{font-family:Fraunces,Georgia,serif;color:#111;line-height:1.6}pre,code{font-family:'JetBrains Mono',monospace}pre{background:#f4f4f0;padding:14px;border-radius:6px}blockquote{border-left:4px solid #a7c3b6;margin:0;padding:8px 16px;color:#555}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}.qd-abstract{border:1px solid #ccc;padding:16px;border-radius:8px}.qd-abstract-label{font-weight:700;text-align:center;margin-bottom:8px}.qd-box{border-radius:8px;padding:12px 16px;margin:12px 0;background:#f4f7f4;border:1px solid #cfe0d5}.qd-center{text-align:center}.qd-row{display:flex;gap:16px}</style></head><body>${compiled.html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // Split slides if slides doctype
  const slides = effectiveDoctype === 'slides' ? splitSlides(compiled.html).filter(s => s.trim()) : null;

  return (
    <div className="qd-app">
      {/* Header */}
      <header className="qd-topbar">
        <div className="qd-topbar-left">
          <button className="qd-icon-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
            <PanelLeft size={16} />
          </button>
          <div className="qd-brand">
            <QdLogo size={22} />
            <span><strong>Quark</strong><span className="muted">down</span></span>
            <span className="qd-pill">Web</span>
          </div>
          <div className="qd-doctitle">
            {compiled.meta.title || active?.name || 'Untitled'}
          </div>
        </div>
        <div className="qd-topbar-center">
          <div className="qd-doctype-switch">
            {DOCTYPES.map(dt => (
              <button
                key={dt.id}
                className={`qd-dt ${effectiveDoctype === dt.id ? 'active' : ''}`}
                onClick={() => setDoctype(dt.id)}
              >
                .doctype {'{'}{dt.label}{'}'}
              </button>
            ))}
          </div>
        </div>
        <div className="qd-topbar-right">
          <button className="qd-icon-btn" onClick={copyOutput} title="Copy HTML">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button className="qd-icon-btn" onClick={downloadHtml} title="Download HTML">
            <Download size={16} />
          </button>
          <button className="qd-btn-primary" onClick={printPdf} title="Print / PDF">
            <FileText size={14} /> Export PDF
          </button>
          <button className="qd-icon-btn" onClick={() => setPreviewOnly(p => !p)} title="Toggle editor">
            <PanelRight size={16} />
          </button>
          <a className="qd-icon-btn" href="https://github.com/iamgio/quarkdown" target="_blank" rel="noreferrer" title="GitHub">
            <Github size={16} />
          </a>
        </div>
      </header>

      <div className="qd-workspace">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="qd-sidebar">
            <div className="qd-side-head">
              <div className="qd-side-title"><Files size={14} /> Documents</div>
              <button className="qd-icon-btn small" onClick={addNewDoc} title="New document">+</button>
            </div>
            <ul className="qd-doc-list">
              {docs.map(d => (
                <li
                  key={d.id}
                  className={activeId === d.id ? 'active' : ''}
                  onClick={() => setActiveId(d.id)}
                >
                  <FileText size={13} />
                  <input
                    className="qd-doc-name"
                    value={d.name}
                    onChange={(e) => renameDoc(d.id, e.target.value)}
                    onClick={(e) => { e.stopPropagation(); setActiveId(d.id); }}
                  />
                  <span className="qd-doc-badge">{d.doctype}</span>
                  <button
                    className="qd-doc-del"
                    onClick={(e) => { e.stopPropagation(); deleteDoc(d.id); }}
                    title="Delete"
                  >×</button>
                </li>
              ))}
            </ul>
            <div className="qd-side-foot">
              <div className="qd-side-hint"><Sparkles size={12} /> Live preview</div>
              <div className="qd-side-hint-sub">Edit source — preview updates instantly.</div>
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="qd-main">
          {!previewOnly && (
            <section className="qd-editor-pane">
              <div className="qd-pane-head">
                <span className="qd-pane-title">source — {active?.name}.qd</span>
                <span className="qd-pane-info">{active?.content.length} chars</span>
              </div>
              <textarea
                className="qd-editor"
                value={active?.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                spellCheck={false}
                placeholder="Start writing Quarkdown..."
              />
            </section>
          )}

          <section className={`qd-preview-pane doctype-${effectiveDoctype} ${previewOnly ? 'full' : ''}`}>
            <div className="qd-pane-head">
              <span className="qd-pane-title">preview — <em>.doctype {'{'}{effectiveDoctype}{'}'}</em></span>
              {effectiveDoctype === 'slides' && slides && (
                <div className="qd-slide-nav">
                  <button className="qd-icon-btn small" onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0}><ChevronLeft size={14} /></button>
                  <span className="qd-slide-count">{slideIdx + 1} / {slides.length}</span>
                  <button className="qd-icon-btn small" onClick={() => setSlideIdx(i => Math.min(slides.length - 1, i + 1))} disabled={slideIdx >= slides.length - 1}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>

            <div className="qd-preview-scroll">
              {effectiveDoctype === 'paged' && <PagedPreview html={compiled.html} meta={compiled.meta} />}
              {effectiveDoctype === 'slides' && <SlidesPreview slides={slides} idx={slideIdx} onIdx={setSlideIdx} />}
              {effectiveDoctype === 'docs' && <DocsPreview html={compiled.html} headings={compiled.headings} meta={compiled.meta} />}
              {effectiveDoctype === 'plain' && <PlainPreview html={compiled.html} meta={compiled.meta} />}
            </div>
          </section>
        </main>
      </div>

      <footer className="qd-statusbar">
        <span>Quarkdown Web — live in-browser interpreter</span>
        <span className="qd-status-right">
          <span className="qd-dot ok" /> ready
          <span className="qd-sep">|</span>
          {compiled.headings.length} headings
          <span className="qd-sep">|</span>
          {Object.keys(compiled).length ? 'compiled' : 'idle'}
        </span>
      </footer>
    </div>
  );
}

function PlainPreview({ html, meta }) {
  return (
    <article className="qd-out qd-out-plain">
      {meta.title && <h1 className="qd-doc-title">{meta.title}</h1>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

function PagedPreview({ html, meta }) {
  return (
    <div className="qd-paged-wrap">
      <div className="qd-page">
        <div className="qd-page-header">{meta.author || ''}</div>
        <article className="qd-out qd-out-paged">
          {meta.title && <h1 className="qd-doc-title">{meta.title}</h1>}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
        <div className="qd-page-footer">1</div>
      </div>
    </div>
  );
}

function SlidesPreview({ slides, idx, onIdx }) {
  if (!slides || slides.length === 0) return <div className="qd-empty">No slides</div>;
  return (
    <div className="qd-slides-wrap">
      <div className="qd-slide">
        <div className="qd-slide-body" dangerouslySetInnerHTML={{ __html: slides[idx] || '' }} />
      </div>
      <div className="qd-slide-dots">
        {slides.map((_, i) => (
          <button key={i} className={`qd-slide-dot ${i === idx ? 'active' : ''}`} onClick={() => onIdx(i)} />
        ))}
      </div>
    </div>
  );
}

function DocsPreview({ html, headings, meta }) {
  return (
    <div className="qd-docs-wrap">
      <aside className="qd-docs-toc">
        <div className="qd-toc-heading">On this page</div>
        <ol>
          {headings.map(h => (
            <li key={h.id} className={`qd-toc-l${h.level}`}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ol>
      </aside>
      <article className="qd-out qd-out-docs">
        {meta.title && <h1 className="qd-doc-title">{meta.title}</h1>}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
