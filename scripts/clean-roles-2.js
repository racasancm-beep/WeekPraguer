const fs = require('fs');
let c = fs.readFileSync('app/register/page.tsx', 'utf8');
c = c.replace(/ \| "CLEANER"/g, '');
c = c.replace(/, "CLEANER"/g, '');

// Also remove the cleaner button
c = c.replace(/<button[^>]*onClick=\{\(\) => setRole\("CLEANER"\)\}[\s\S]*?<\/button>/, '');

fs.writeFileSync('app/register/page.tsx', c);

let terms = fs.readFileSync('app/terms/page.tsx', 'utf8');
terms = terms.replace(/,\s*and\s*Cleaners/gi, '');
terms = terms.replace(/cleaners/gi, 'partners');
fs.writeFileSync('app/terms/page.tsx', terms);

let comp = fs.readFileSync('docs/COMPLIANCE.md', 'utf8');
comp = comp.replace(/cleaners/gi, 'partners');
fs.writeFileSync('docs/COMPLIANCE.md', comp);

let pricing = fs.readFileSync('lib/pricing.ts', 'utf8');
pricing = pricing.replace(/cleanerEarnings[^,]*,\s*/g, '');
pricing = pricing.replace(/cleanerEarnings:\s*0\s*,?/g, '');
fs.writeFileSync('lib/pricing.ts', pricing);

console.log("Second cleanup done");
