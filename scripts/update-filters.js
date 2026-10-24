const fs = require('fs');
let c = fs.readFileSync('components/explore/space-filters.tsx', 'utf8');

c = c.replace(
    'const [priceRange, setPriceRange] = useState([0, parseInt(searchParams.get("maxPrice") || "200")]);',
    'const [priceRange, setPriceRange] = useState([0, parseInt(searchParams.get("maxPrice") || "200")]);\n    const [sort, setSort] = useState(searchParams.get("sort") || "");'
);

c = c.replace(
    'if (capacity) params.set("capacity", capacity);',
    'if (capacity) params.set("capacity", capacity);\n        if (sort && priceRange[1] < 200) params.set("sort", sort);'
);

c = c.replace(
    'setPriceRange([0, 200]);',
    'setPriceRange([0, 200]);\n        setSort("");'
);

const sliderBlock = `                    {/* Hourly Price Range */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <Label className="font-semibold uppercase tracking-wider text-gray-500">Max price / hour</Label>
                            <span className="font-bold text-[#008080]">{priceRange[1] >= 200 ? "No limit" : \`\${priceRange[1]} RON/h\`}</span>
                        </div>
                        <Slider
                            value={[priceRange[1]]}
                            max={200}
                            min={10}
                            step={5}
                            onValueChange={(val) => setPriceRange([0, val[0]])}
                        />
                        {priceRange[1] < 200 && (
                            <div className="pt-2">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full h-8 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#008080]"
                                >
                                    <option value="">Cele mai populare (Implicit)</option>
                                    <option value="price_asc">Preț: Crescător</option>
                                    <option value="price_desc">Preț: Descrescător</option>
                                </select>
                            </div>
                        )}
                    </div>`;

c = c.replace(/\{\/\* Hourly Price Range \*\/\}[\s\S]*?<\/div>\s*\{\/\* Apply Buttons \*\/\}/, sliderBlock + '\n\n                    {/* Apply Buttons */}');

fs.writeFileSync('components/explore/space-filters.tsx', c);
