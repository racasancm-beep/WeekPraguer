const fs = require('fs');

let content = fs.readFileSync('app/layout.tsx', 'utf8');

content = content.replace(
    'import { Providers } from "@/components/providers";',
    'import { Providers } from "@/components/providers";\nimport { FloatingHomeButton } from "@/components/ui/floating-home-button";'
);

content = content.replace(
    '{children}',
    '{children}\n                    <FloatingHomeButton />'
);

fs.writeFileSync('app/layout.tsx', content);
console.log("Updated layout");
