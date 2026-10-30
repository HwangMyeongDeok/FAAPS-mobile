// Diagnoses the panel/surface background question and the Pressable style
// conflict, by walking the real rendered DOM.
import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const URL = process.argv[2] || 'http://localhost:8081';

const MOCK_SESSION = {
  token: 'mock.jwt.u-student-duc',
  user: {
    id: 'u-student-duc',
    role_id: 'r-student',
    email: 'duchmse173564@fpt.edu.vn',
    auth_provider: 'GOOGLE',
    full_name: 'Hoàng Minh Đức',
    phone: '0879395607',
    avatar_url: null,
    status: 'ACTIVE',
    email_verified_at: '2026-09-10T00:00:00Z',
    last_login_at: '2026-10-18T21:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
  },
  student_code: 'SE173564',
};

const browser = await Browser.launch();
const page = await browser.newPage({ width: 390, height: 844, dsf: 1, mobile: true });

await page.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => {
    const s = ${JSON.stringify(MOCK_SESSION)};
    try {
      localStorage.setItem('faaps.auth', JSON.stringify({ state: { session: s }, version: 0 }));
      localStorage.setItem('faaps.auth.session', JSON.stringify(s));
    } catch (e) {}
  })()`,
}).catch(() => {});

await page.goto(URL, { timeoutMs: 60000, settleMs: 4000 });
await sleep(3000);

const out = await page.eval(`(() => {
  const res = {};

  // A. the ancestor chain of the greeting: where does the ground colour live?
  const hello = [...document.querySelectorAll('div,span')]
    .find((el) => el.childElementCount === 0 && (el.textContent || '').trim().startsWith('Chào'));
  const chain = [];
  for (let p = hello; p && p !== document.documentElement; p = p.parentElement) {
    const cs = getComputedStyle(p);
    chain.push({
      tag: p.tagName,
      cls: (typeof p.className === 'string' ? p.className : '').slice(0, 60),
      bg: cs.backgroundColor,
      pad: cs.paddingLeft,
      mt: cs.marginTop,
    });
  }
  res.ancestors = chain;

  // B. any element with a white/opaque fill that looks like a panel
  const panels = [];
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    if (!bg.startsWith('rgb(255, 255, 255)') && bg !== 'rgb(255,255,255)') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 140 || r.height < 60) continue;
    panels.push({
      w: Math.round(r.width), h: Math.round(r.height),
      radius: cs.borderTopLeftRadius,
      text: (el.innerText || '').trim().slice(0, 40),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
    });
  }
  res.whitePanels = panels.slice(0, 8);

  // C. every distinct background colour present, with the count
  const bgs = new Map();
  for (const el of document.querySelectorAll('*')) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg === 'rgba(0, 0, 0, 0)') continue;
    bgs.set(bg, (bgs.get(bg) || 0) + 1);
  }
  res.backgrounds = [...bgs.entries()].sort((a, b) => b[1] - a[1]);

  // D. how the primary button's style prop survived: does the DOM node carry
  //    an inline style attribute, or only classes?
  const cta = [...document.querySelectorAll('div,button,a')].find((el) => (el.innerText || '').trim() === 'Xem chương trình khung');
  if (cta) {
    res.cta = {
      tag: cta.tagName,
      inlineStyle: cta.getAttribute('style'),
      cls: (typeof cta.className === 'string' ? cta.className : '').slice(0, 200),
      bg: getComputedStyle(cta).backgroundColor,
    };
  }

  // E. the text colour of the CTA label
  const label = [...document.querySelectorAll('div,span')].find((el) => el.childElementCount === 0 && (el.textContent || '').trim() === 'Xem chương trình khung');
  if (label) {
    res.ctaLabel = { color: getComputedStyle(label).color, size: getComputedStyle(label).fontSize, weight: getComputedStyle(label).fontWeight };
  }

  // F. font families actually used
  const fams = new Map();
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (!t) continue;
    const f = getComputedStyle(el).fontFamily;
    fams.set(f, (fams.get(f) || 0) + t.length);
  }
  res.families = [...fams.entries()].sort((a, b) => b[1] - a[1]);

  // G. is there a stylesheet rule for tailwind utility classes?
  const sheets = [...document.styleSheets].map((s) => { try { return s.cssRules.length; } catch (e) { return 'x'; } });
  res.styleSheetRuleCounts = sheets;

  // H. the rail: do the segments have height and fill?
  res.rail = [...document.querySelectorAll('div')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 8 && r.width < 40 && r.height >= 40 && r.height <= 60; })
    .slice(0, 12)
    .map((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, radius: cs.borderTopLeftRadius }; });

  return res;
})()`);

console.log(JSON.stringify(out, null, 1));
await browser.close();
