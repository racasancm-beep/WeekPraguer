const fs = require('fs');

let nav = fs.readFileSync('components/layout/main-nav.tsx', 'utf8');

nav = nav.replace(
`<div className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Package className="w-4 h-4 text-[#008080]" /> Curățenie
                                </div>
                                <div className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Shield className="w-4 h-4 text-[#008080]" /> Asigurare
                                </div>
                                <div className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Settings className="w-4 h-4 text-[#008080]" /> Management
                                </div>`,
`<Link href="/explore?type=servicii&category=curatenie" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Package className="w-4 h-4 text-[#008080]" /> Curățenie
                                </Link>
                                <Link href="/explore?type=servicii&category=securitate" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Shield className="w-4 h-4 text-[#008080]" /> Asigurare & Pază
                                </Link>
                                <Link href="/explore?type=servicii&category=asistenta" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Settings className="w-4 h-4 text-[#008080]" /> Management & IT
                                </Link>`
);

fs.writeFileSync('components/layout/main-nav.tsx', nav, 'utf8');
console.log('main-nav.tsx updated with service links');
