const fs = require('fs');
let c = fs.readFileSync('app/owner/dashboard/page.tsx', 'utf8');

// Remove Cleaner interface
c = c.replace(/interface Cleaner \{[\s\S]*?\}/g, '');

// Remove cleaners state
c = c.replace(/const \[cleaners, setCleaners\] = useState<Cleaner\[\]>\(\[\]\);/g, '');

// Remove modals state
c = c.replace(/\/\/ Cleaner Selection Modal\s*const \[isModalOpen, setIsModalOpen\] = useState\(false\);\s*const \[selectedBookingId, setSelectedBookingId\] = useState<string \| null>\(null\);/g, '');

// Remove fetchCleaners call
c = c.replace(/fetchCleaners\(\);/g, '');

// Remove fetchCleaners function
c = c.replace(/const fetchCleaners = async \(\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};/g, '');

// Remove toggleCleaning function
c = c.replace(/const toggleCleaning = async \([^)]*\) => \{[\s\S]*?catch \(e\) \{\s*toast\.error\("Network error\."\);\s*\}\s*\};/g, '');

// Remove handleHireCleanerClick function
c = c.replace(/const handleHireCleanerClick = \(bookingId: string\) => \{[\s\S]*?\};/g, '');

// Remove the cleaner UI from the map (the <div> holding the cleaning request buttons)
c = c.replace(/<div className="mt-2">[\s\S]*?\}\s*<\/div>\s*<\/div>\s*\)\)\s*\}/g, '</div>\n                                    </div>\n                                ))\n                            }');

// Remove Cleaner Selection Modal JSX
c = c.replace(/\{\/\* Cleaner Selection Modal \*\/\}[\s\S]*?<\/Dialog>/g, '');

fs.writeFileSync('app/owner/dashboard/page.tsx', c);
console.log('Cleaned owner dashboard');
