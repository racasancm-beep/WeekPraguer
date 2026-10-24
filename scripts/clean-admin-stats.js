const fs = require('fs');

let c = fs.readFileSync('app/api/admin/stats/route.ts', 'utf8');
c = c.replace(/const cleaners = users\.filter\(\(u: any\) => u\.role === "CLEANER"\);/g, '');
c = c.replace(/const cleanerEarnings = [^;]*;/g, '');
c = c.replace(/cleaner: cleanerEarnings/g, '');
c = c.replace(/acc\.totalCleanerPayout \+= split\.cleaner;/g, '');
c = c.replace(/, totalCleanerPayout: 0/g, '');
c = c.replace(/acc\.cleaner \+= split\.cleaner;/g, '');
c = c.replace(/, cleaner: 0/g, '');
c = c.replace(/cleanerRevenue: financials\.cleaner,/g, '');
c = c.replace(/cleaners: cleaners\.map\(\(u: any\) => \(\{ id: u\.id, name: u\.name, email: u\.email \}\)\)/g, '');
// Handle trailing commas
c = c.replace(/,\s*\}/g, '}');

// Note: I'll just write a cleaner version of getSplit directly.
let newGetSplit = `        const getSplit = (b: any) => {
            const total = b.totalPrice || 0;
            const isSelfClean = b.space?.selfCleaning || false;

            return {
                renter: total,
                owner: b.ownerEarnings > 0 ? b.ownerEarnings : (isSelfClean ? total * 0.70 : total * 0.60),
                admin: b.adminEarnings > 0 ? b.adminEarnings : (isSelfClean ? total * 0.30 : total * 0.25)
            };
        };`;
        
c = c.replace(/const getSplit = \([\s\S]*?\};\s*\};/g, newGetSplit);

fs.writeFileSync('app/api/admin/stats/route.ts', c);
console.log('Fixed admin stats API');
