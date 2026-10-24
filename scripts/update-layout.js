const fs = require('fs');
let c = fs.readFileSync('app/layout.tsx', 'utf8');

c = c.replace(
    'import { Providers } from "@/components/providers";',
    'import { Providers } from "@/components/providers";\nimport { MainNav } from "@/components/layout/main-nav";'
);

c = c.replace(
    '{children}',
    '<MainNav />\n                    {children}'
);

fs.writeFileSync('app/layout.tsx', c);
