// Minimal Quarkdown interpreter (browser JS)
// Supports: markdown basics + Quarkdown function calls + user-defined functions + variables

import katex from 'katex';

function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, trust: true });
  } catch (e) {
    return `<span class="qd-math qd-math-error">${escHtml(tex)}</span>`;
  }
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Parse .name {arg1} {arg2} key:{val} out of a header line
function parseHeader(line) {
  const m = line.match(/^\s*\.([A-Za-z_][A-Za-z0-9_-]*)\s*(.*)$/);
  if (!m) return null;
  const name = m[1];
  const rest = m[2];
  const args = [];
  const kwargs = {};
  const re = /(?:([A-Za-z_][A-Za-z0-9_-]*):)?\{([^{}]*)\}/g;
  let mm;
  while ((mm = re.exec(rest)) !== null) {
    if (mm[1]) kwargs[mm[1]] = mm[2];
    else args.push(mm[2]);
  }
  // trailing text after last brace (pipe-syntax) e.g. `.docauthor | MIT News`
  const trailing = rest.replace(re, '').trim();
  return { name, args, kwargs, trailing };
}

function getIndent(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

// Group lines into blocks. A function-call block is a header line + subsequent lines that are more-indented.
function parseBlocks(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    // fenced code block
    if (/^```/.test(trimmed)) {
      const fence = trimmed.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', lang: fence, content: buf.join('\n') });
      continue;
    }
    if (trimmed === '') {
      blocks.push({ type: 'blank' });
      i++;
      continue;
    }
    // Quarkdown function call
    if (/^\s*\./.test(line) && !/^\s*\.\s/.test(line)) {
      const header = parseHeader(line);
      if (header) {
        const baseIndent = getIndent(line);
        i++;
        const body = [];
        while (i < lines.length) {
          const l = lines[i];
          if (l.trim() === '') { body.push(''); i++; continue; }
          if (getIndent(l) > baseIndent) {
            body.push(l.slice(baseIndent + 4 <= getIndent(l) ? baseIndent + 4 : getIndent(l)));
            i++;
          } else break;
        }
        // trim trailing blank body lines
        while (body.length && body[body.length - 1] === '') body.pop();
        blocks.push({ type: 'fn', ...header, body: body.join('\n') });
        continue;
      }
    }
    // Display math $$...$$
    if (/^\$\$/.test(trimmed)) {
      const end = lines.findIndex((l, j) => j > i && /^\$\$/.test(l.trim()));
      if (end !== -1) {
        const tex = lines.slice(i + 1, end).join('\n');
        blocks.push({ type: 'math', tex, display: true });
        i = end + 1;
        continue;
      }
    }
    // Slide separator
    if (/^---+\s*$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }
    // Heading
    const hm = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      blocks.push({ type: 'heading', level: hm[1].length, text: hm[2] });
      i++;
      continue;
    }
    // Blockquote
    if (/^>/.test(trimmed)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', content: buf.join('\n') });
      continue;
    }
    // List (unordered / ordered)
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      const ordered = /^\s*\d+\.\s+/.test(line);
      while (i < lines.length && (/^\s*[-*+]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        buf.push(lines[i].replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered, items: buf });
      continue;
    }
    // Table
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[-:\s|]+\|?\s*$/.test(lines[i + 1])) {
      const buf = [line];
      i++;
      while (i < lines.length && /\|/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', rows: buf });
      continue;
    }
    // Paragraph
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^\s*\./.test(lines[i]) && !/^#{1,6}\s/.test(lines[i].trim()) && !/^>/.test(lines[i].trim()) && !/^---+\s*$/.test(lines[i].trim()) && !/^```/.test(lines[i].trim())) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'para', content: buf.join('\n') });
  }
  return blocks;
}

// Inline markdown -> HTML (bold, italic, code, links, images, math)
function renderInline(text, ctx) {
  let t = text;
  // Variable interpolation .name -> value
  if (ctx && ctx.vars) {
    for (const [k, v] of Object.entries(ctx.vars)) {
      const re = new RegExp('\\.' + k + '\\b', 'g');
      t = t.replace(re, v);
    }
  }
  // Escape HTML first, then re-inject known markdown
  // We'll do it in two passes using placeholders for code spans
  const codeSpans = [];
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codeSpans.push(c);
    return `\u0000C${codeSpans.length - 1}\u0000`;
  });
  // Math inline $..$
  const mathSpans = [];
  t = t.replace(/\$([^$\n]+)\$/g, (_, m) => {
    mathSpans.push(m);
    return `\u0000M${mathSpans.length - 1}\u0000`;
  });
  t = escHtml(t);
  // Images ![alt](src)
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, a, s) => `<img alt="${a}" src="${s}" />`);
  // Links [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, a, s) => `<a href="${s}" target="_blank" rel="noreferrer">${a}</a>`);
  // Bold + italic ***x***
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold **x**
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *x* or _x_
  t = t.replace(/(?<![*\w])\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  t = t.replace(/(?<![_\w])_([^_\n]+)_(?!_)/g, '<em>$1</em>');
  // restore code
  t = t.replace(/\u0000C(\d+)\u0000/g, (_, n) => `<code>${escHtml(codeSpans[+n])}</code>`);
  // restore math (render with KaTeX)
  t = t.replace(/\u0000M(\d+)\u0000/g, (_, n) => renderMath(mathSpans[+n], false));
  return t;
}

// Built-in function handlers
const builtins = {
  doctitle: (b, ctx) => { ctx.meta.title = b.args[0] || b.trailing; return ''; },
  docauthor: (b, ctx) => {
    // if used inline (no args and inside body it wouldn't get here)
    if (b.args[0]) { ctx.meta.author = b.args[0]; return ''; }
    if (b.trailing) return `<span class="qd-author">${escHtml(ctx.meta.author || '')} ${escHtml(b.trailing)}</span>`;
    return `<span class="qd-author">${escHtml(ctx.meta.author || '')}</span>`;
  },
  doctype: (b, ctx) => { ctx.meta.doctype = b.args[0] || 'plain'; return ''; },
  pagemargin: (b, ctx) => {
    const pos = b.args[0] || 'topright';
    return `<div class="qd-pagemargin qd-pm-${pos}">${renderBlocks(parseBlocks(b.body), ctx)}</div>`;
  },
  abstract: (b, ctx) => `<div class="qd-abstract"><div class="qd-abstract-label">Abstract</div>${renderBlocks(parseBlocks(b.body), ctx)}</div>`,
  center: (b, ctx) => `<div class="qd-center">${renderBlocks(parseBlocks(b.body), ctx)}</div>`,
  row: (b, ctx) => {
    const align = b.kwargs.alignment || 'start';
    return `<div class="qd-row qd-align-${align}">${renderBlocks(parseBlocks(b.body), ctx)}</div>`;
  },
  column: (b, ctx) => `<div class="qd-column">${renderBlocks(parseBlocks(b.body), ctx)}</div>`,
  box: (b, ctx) => {
    const type = b.kwargs.type || 'note';
    const title = b.args[0] || type.charAt(0).toUpperCase() + type.slice(1);
    return `<div class="qd-box qd-box-${type}"><div class="qd-box-title">${escHtml(title)}</div><div class="qd-box-body">${renderBlocks(parseBlocks(b.body), ctx)}</div></div>`;
  },
  clip: (b, ctx) => {
    const shape = b.args[0] || 'circle';
    return `<div class="qd-clip qd-clip-${shape}">${renderBlocks(parseBlocks(b.body), ctx)}</div>`;
  },
  tableofcontents: (_b, ctx) => {
    const toc = ctx.headings.map(h => `<li class="qd-toc-l${h.level}"><a href="#${h.id}">${escHtml(h.text)}</a></li>`).join('');
    return `<nav class="qd-toc"><div class="qd-toc-title">Contents</div><ol>${toc}</ol></nav>`;
  },
  var: (b, ctx) => { ctx.vars[b.args[0]] = b.args[1] || ''; return ''; },
  function: (b, ctx) => {
    const name = b.args[0];
    if (!name) return '';
    // First body line typically contains "arg1 arg2:" signature
    const bodyLines = b.body.split('\n');
    let sig = [];
    let idx = 0;
    if (bodyLines[0] && /:\s*$/.test(bodyLines[0])) {
      sig = bodyLines[0].replace(/:\s*$/, '').trim().split(/\s+/).filter(Boolean);
      idx = 1;
    }
    const template = bodyLines.slice(idx).join('\n');
    ctx.userFns[name] = { params: sig, template };
    return '';
  },
  super: (b, ctx) => renderBlocks(parseBlocks(b.body), ctx), // decorative wrapper
  extend: (_b) => '', // no-op
};

function applyUserFn(fn, b, ctx) {
  let t = fn.template;
  // positional args
  fn.params.forEach((p, idx) => {
    if (p.endsWith(':')) return;
    const val = b.args[idx] != null ? b.args[idx] : (b.kwargs[p] || '');
    t = t.replace(new RegExp('\\.' + p + '\\b', 'g'), val);
  });
  // keyword params (with trailing :)
  fn.params.filter(p => p.endsWith(':')).forEach(p => {
    const key = p.slice(0, -1);
    const val = b.kwargs[key] || '';
    t = t.replace(new RegExp('\\.' + key + '\\b', 'g'), val);
  });
  // Handle .picture / body arg substitution: replace `.picture` etc with body content
  // Also allow any lingering .body to be replaced by b.body
  const bodyRendered = b.body ? renderBlocks(parseBlocks(b.body), ctx) : '';
  // If the template references .picture and body starts with ![...](...) treat body as picture
  t = t.replace(/\.picture\b/g, () => bodyRendered);
  t = t.replace(/\.body\b/g, () => bodyRendered);
  return renderBlocks(parseBlocks(t), ctx);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderBlock(b, ctx) {
  switch (b.type) {
    case 'blank': return '';
    case 'hr': return '<hr class="qd-slide-sep" />';
    case 'heading': {
      const id = slugify(b.text);
      ctx.headings.push({ id, level: b.level, text: b.text });
      return `<h${b.level} id="${id}">${renderInline(b.text, ctx)}</h${b.level}>`;
    }
    case 'para': return `<p>${renderInline(b.content, ctx)}</p>`;
    case 'quote': return `<blockquote>${renderBlocks(parseBlocks(b.content), ctx)}</blockquote>`;
    case 'math': return `<div class="qd-math-block">${renderMath(b.tex, true)}</div>`;
    case 'code': return `<pre class="qd-pre"><code>${escHtml(b.content)}</code></pre>`;
    case 'list': {
      const tag = b.ordered ? 'ol' : 'ul';
      return `<${tag}>${b.items.map(it => `<li>${renderInline(it, ctx)}</li>`).join('')}</${tag}>`;
    }
    case 'table': {
      const rows = b.rows.map(r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
      const header = rows[0];
      const body = rows.slice(2);
      return `<table class="qd-table"><thead><tr>${header.map(h => `<th>${renderInline(h, ctx)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${renderInline(c, ctx)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }
    case 'fn': {
      if (builtins[b.name]) return builtins[b.name](b, ctx);
      if (ctx.userFns[b.name]) return applyUserFn(ctx.userFns[b.name], b, ctx);
      // Unknown function — render trailing pipe content as inline text, else fallback
      if (b.trailing && !b.body) return `<span class="qd-unknown">${renderInline(b.trailing, ctx)}</span>`;
      const argsRender = b.args.map(a => renderInline(a, ctx)).join(' ');
      const bodyRender = b.body ? renderBlocks(parseBlocks(b.body), ctx) : '';
      return `<div class="qd-fn qd-fn-${b.name}">${argsRender}${bodyRender}</div>`;
    }
    default: return '';
  }
}

function renderBlocks(blocks, ctx) {
  return blocks.map(b => renderBlock(b, ctx)).join('\n');
}

export function compile(source) {
  const ctx = {
    meta: { title: '', author: '', doctype: null },
    vars: {},
    userFns: {},
    headings: [],
  };
  // Two-pass: first pass to collect defs (functions, vars, doctype)
  const blocks = parseBlocks(source);
  // Split into slides if any hr present later
  const html = renderBlocks(blocks, ctx);
  // If slides, split by <hr class="qd-slide-sep">
  return { html, meta: ctx.meta, headings: ctx.headings };
}

export function splitSlides(html) {
  return html.split(/<hr class="qd-slide-sep"\s*\/>/);
}
