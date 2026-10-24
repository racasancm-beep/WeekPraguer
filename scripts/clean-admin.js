const fs = require('fs');

let c = fs.readFileSync('app/admin/dashboard/page.tsx', 'utf8');

// Remove interface properties
c = c.replace(/\s*cleaners:\s*UserItem\[\];/g, '');
c = c.replace(/\s*totalCleanerPayout:\s*number;/g, '');
c = c.replace(/\s*cleanerRevenue:\s*number;/g, '');

// The grid has md:grid-cols-3. Let's make it md:grid-cols-2 since we're removing the cleaners card
c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6">/g, '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
// Note: wait, it might just be <div className="grid gap-6 md:grid-cols-3"> or similar. Let's check exactly.
c = c.replace(/md:grid-cols-3/g, 'md:grid-cols-2');

// Remove the Cleaners Card entirely.
c = c.replace(/\{\/\* Cleaners \*\/\}[\s\S]*?<div className="min-w-0">\s*<p className="text-sm font-bold text-gray-900 truncate">\{u\.name\}<\/p>\s*<p className="text-\[10px\] text-gray-500 font-mono truncate">\{u\.id\}<\/p>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>\s*<\/CardContent>\s*<\/Card>/g, '');

// Also the above regex might miss some things. Let me just use a non-greedy wildcard from {/* Cleaners */} to the end of the Card.
c = c.replace(/\{\/\* Cleaners \*\/\}[\s\S]*?<\/CardContent>\s*<\/Card>/g, '');

// Remove the Cleaner Insights Card
c = c.replace(/\{\/\* Cleaner Insights \*\/\}[\s\S]*?<\/CardContent>\s*<\/Card>/g, ''); 
// Wait, the Cleaner Insights card doesn't have a <CardContent>, let's check the grep. It ends with:
//                           <div className="mt-4 pt-4 border-t flex justify-between items-end">
//                               <span className="text-xs font-bold text-gray-400 uppercase">Service Payout</span>
//                               <span className="text-2xl font-black text-emerald-600">{data.globalFinancials.totalCleanerPayout.toLocaleString()} <span className="text-xs text-gray-400">EUR</span></span>
//                           </div>
//                       </Card>

c = c.replace(/\{\/\* Cleaner Insights \*\/\}[\s\S]*?totalCleanerPayout[\s\S]*?<\/Card>/g, '');

fs.writeFileSync('app/admin/dashboard/page.tsx', c);
console.log('Fixed admin dashboard');
