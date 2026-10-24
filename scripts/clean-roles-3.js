const fs = require('fs');
let r = fs.readFileSync('components/reviews/review-modal.tsx', 'utf8');
r = r.replace(/ \| "owner_to_cleaner" \| "cleaner_to_renter"/g, '');
r = r.replace(/type === "owner_to_cleaner" \? "Cleaner" : /g, '');
r = r.replace(/type === "cleaner_to_renter" \? "Renter" : /g, '');
fs.writeFileSync('components/reviews/review-modal.tsx', r);
console.log("Third cleanup done");
