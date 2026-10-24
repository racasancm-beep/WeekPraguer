const fs = require('fs');

function cleanFile(path, replacer) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = replacer(content);
        fs.writeFileSync(path, content);
    }
}

cleanFile('app/portal/page.tsx', c => c.replace(/case "CLEANER":\s*router\.push\("\/cleaner\/dashboard"\);\s*break;/g, ''));
cleanFile('middleware.ts', c => {
    let out = c.replace(/\|\|\s*token\.role === "CLEANER"/g, '');
    out = out.replace(/if \(request\.nextUrl\.pathname\.startsWith\("\/cleaner"\) && token\.role !== "CLEANER"\) \{\s*return NextResponse\.redirect\(new URL\("\/portal", request\.url\)\);\s*\}/g, '');
    return out;
});
cleanFile('app/api/admin/verification-queue/route.ts', c => c.replace(/role: "CLEANER",/g, ''));
cleanFile('app/api/auth/register/route.ts', c => {
    let out = c.replace(/\| "CLEANER"/g, '');
    out = out.replace(/z\.enum\(\["OWNER", "RENTER", "CLEANER"\]\)/g, 'z.enum(["OWNER", "RENTER"])');
    return out;
});
cleanFile('scripts/check-bookings.ts', c => {
    let out = c.replace(/cleanerEarnings: true,/g, '');
    out = out.replace(/cleanerEarnings:\s*\$\{.*?\},/g, '');
    return out;
});
cleanFile('scripts/fix-cleaning-fees.ts', c => {
    let out = c.replace(/cleanerEarnings: 0,/g, '');
    return out;
});
// Need to fix owner dashboard which still has handleHireCleanerClick references (b.cleaningLog etc)
cleanFile('app/owner/dashboard/page.tsx', c => {
    return c.replace(/\{b\.cleaningLog[\s\S]*?\}\s*<\/div>\s*<\/div>/g, '</div>\n                                        </div>');
});

console.log("Cleanup script done.");
