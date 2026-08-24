// Sample Quarkdown documents

export const samples = [
  {
    id: 'welcome',
    name: 'Welcome',
    doctype: 'plain',
    content: `.doctitle {Welcome to Quarkdown}
.docauthor {You}

# Welcome to Quarkdown

**Markdown with superpowers.** Write plain Markdown, then reach for functions when you need more.

> This is a live in-browser Quarkdown environment.
> Edit the source on the left — the preview updates instantly.

## Try the essentials

- **Bold**, _italic_, \`inline code\`
- Lists, quotes, links: [Quarkdown](https://quarkdown.com)
- Images, tables, math $e^{i\\pi}+1=0$

## Layout builders

.center
    This paragraph is **centered** using a function call.

.row
    - Item A
    - Item B
    - Item C

.box type:{tip}
    You can define your own functions too. See the *Functions* sample.

## Switch doctype

Use the pill at the top: **plain** for notes, **paged** for papers, **slides** for talks, **docs** for wikis.
`,
  },
  {
    id: 'paper',
    name: 'Black hole paper',
    doctype: 'paged',
    content: `.doctitle {X-ray flashes from a supermassive black hole}
.docauthor {Jennifer Chu}

.pagemargin {topright}
    .docauthor | MIT News

# X-ray flashes from a supermassive black hole

.abstract
    One supermassive black hole has kept astronomers glued to their scopes
    for the last several years. The black hole in question is \`1ES 1927+654\`,
    which is about as massive as a million suns and sits in a galaxy that is
    270 million light-years away. In 2018, astronomers at MIT and elsewhere
    observed that the black hole's corona — a cloud of whirling, white-hot
    plasma — suddenly **disappeared**, before reassembling months later.
    The brief though dramatic shut-off was a first in black hole astronomy.

> This would be the closest thing we know of around any black hole.
> — Megan Masterson, a graduate student in physics at MIT

## 1.1 Introduction

A transitional system of $N$ coupled oscillators exhibits resonance under specific
perturbation conditions. This paper examines the boundaries of the classical KAM
theorem near low-order resonances.

## 1.2 Main result

Let $E_j(t)$ denote the energy of the $j$-th mode. We show that the resonant energy
exchange satisfies the following bound over timescales of order $T^*$:

$$E_j(t) = E_j(0) + \\varepsilon^{1/2} \\sum A_k \\, e^{i(k \\omega)t} + O(\\varepsilon)$$

## 1.3 Numerical verification

.center
    | ε | T* (predicted) | T* (observed) |
    |---|---|---|
    | 10⁻² | 1.4 × 10⁴ | 1.6 × 10⁴ |
    | 10⁻³ | 2.7 × 10⁵ | 3.1 × 10⁵ |
    | 10⁻⁴ | 8.9 × 10⁶ | 7.2 × 10⁶ |

The agreement confirms the predicted scaling within a factor of two across three
orders of magnitude in ε.
`,
  },
  {
    id: 'coffee',
    name: 'Coffee brewing guide',
    doctype: 'plain',
    content: `.doctitle {Coffee Brewing Guide}

# Coffee Brewing Guide

A quick, practical guide to brewing better coffee at home.

## 1.1 Brew methods

Each method extracts flavor differently depending on contact time, grind size,
and water temperature.

| Method       | Grind        | Time     | Strength           |
|--------------|--------------|----------|--------------------|
| Pour over    | Medium–fine  | 3–4 min  | Light, clean       |
| Espresso     | Fine         | 25–30 sec| Bold, concentrated |
| French press | Coarse       | 4 min    | Full-bodied, rich  |

## 1.2 Water temperature

Water temperature has a huge impact on extraction. The sweet spot is between
**90°C** and **96°C** for most methods.

.box type:{tip}
    If you don't have a thermometer, let boiling water rest for 30–45 seconds
    before pouring.

## 1.3 The golden ratio

.center
    **1 : 16** — one part coffee to sixteen parts water.

Adjust to taste. Stronger? Try 1:14. Milder? Try 1:18.
`,
  },
  {
    id: 'slides',
    name: 'Slides demo',
    doctype: 'slides',
    content: `.doctitle {Introducing Quarkdown}
.docauthor {iamgio}

# Introducing Quarkdown

**Markdown with superpowers.**

From ideas to papers, presentations, websites, books, and knowledge bases.

---

## Why?

- Markdown is familiar and fast to write
- LaTeX/Typst are powerful but heavy
- What if we had **both**?

---

## One source, many targets

.row
    - .doctype {plain}
    - .doctype {paged}
    - .doctype {slides}
    - .doctype {docs}

---

## Functions in Markdown

\`\`\`
.function {greet}
    to from:
    **Hello, .to** from .from!

.greet {world} from:{iamgio}
\`\`\`

---

## Thank you!

.center
    Questions?
`,
  },
  {
    id: 'functions',
    name: 'Custom functions',
    doctype: 'plain',
    content: `.doctitle {Custom Functions}

# Custom functions & variables

Quarkdown functions turn repetition into a one-liner.

## Define

.function {greet}
    to from:
    **Hello, .to** from .from!

## Call

.greet {world} from:{iamgio}

.greet {reader} from:{Quarkdown}

## Variables

.var {project} {Quarkdown}

You are reading the **.project** live editor.

## Loops via functions

.function {feature}
    icon name desc:
    - **.icon .name** — .desc

.feature {⚡} {Fast} {Instant preview as you type}
.feature {🔒} {Safe} {Restrictive permission system by default}
.feature {📚} {Versatile} {One source, many outputs}
`,
  },
  {
    id: 'docs',
    name: 'Docs / Wiki',
    doctype: 'docs',
    content: `.doctitle {Quarkdown Wiki}

# Getting started

Quarkdown is a modern Markdown-based typesetting system. This page walks you
through your first document.

## Installation

Follow the platform-specific instructions on the home page. Once installed,
verify with:

\`\`\`
quarkdown --version
\`\`\`

## Your first document

Create a new file \`hello.qd\`:

\`\`\`
.doctitle {Hello}

# Hello, world

Welcome to **Quarkdown**.
\`\`\`

Then compile:

\`\`\`
quarkdown c hello.qd -p -w
\`\`\`

## Document types

| Doctype | Best for |
|---------|----------|
| plain   | Notes, static sites |
| paged   | Papers, books |
| slides  | Presentations |
| docs    | Wikis, documentation |

.box type:{note}
    You can switch doctype at any time by editing the \`.doctype\` call
    at the top of the file.

## Next steps

- Explore the [standard library](#)
- Read about [custom functions](#)
- Deploy your site to GitHub Pages
`,
  },
];
