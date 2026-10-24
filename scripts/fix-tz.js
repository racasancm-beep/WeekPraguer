const fs = require('fs');
let c = fs.readFileSync('app/spaces/[id]/page.tsx', 'utf8');

c = c.replace(/body: JSON\.stringify\(\{\s*spaceId: space\?\.id,\s*startTime: firstDate,\s*endTime: lastDate,\s*totalPrice: calculateTotalPrice\(\),\s*slots: Object\.values\(slots\),\s*\}\),/,
`body: JSON.stringify({
                    spaceId: space?.id,
                    startTime: firstDate,
                    endTime: lastDate,
                    totalPrice: calculateTotalPrice(),
                    slots: Object.values(slots).map(s => {
                        const d = new Date(s.date);
                        return {
                            ...s,
                            date: [
                                d.getFullYear(),
                                String(d.getMonth() + 1).padStart(2, '0'),
                                String(d.getDate()).padStart(2, '0')
                            ].join('-')
                        };
                    }),
                }),`);

fs.writeFileSync('app/spaces/[id]/page.tsx', c);
