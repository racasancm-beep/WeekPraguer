const fs = require('fs');

let c = fs.readFileSync('components/explore/space-filters.tsx', 'utf8');

const badBlock = `{AMENITIES_OPTIONS.map((amenity) => (
                                <div key={amenity.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={amenity.id}
                                        checked={selectedAmenities.includes(amenity.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedAmenities([...selectedAmenities, amenity.id]);
                                            } else {
                                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.id));
                                            }
                                        }}
                                    />
                                    <label htmlFor={amenity.id} className="text-xs text-gray-600 dark:text-gray-300 font-normal cursor-pointer select-none">
                                        {amenity.label}
                                    </label>
                                </div>
                            ))}`;

const goodBlock = `{AMENITIES_OPTIONS.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={amenity}
                                        checked={selectedAmenities.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedAmenities([...selectedAmenities, amenity]);
                                            } else {
                                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                            }
                                        }}
                                    />
                                    <label htmlFor={amenity} className="text-xs text-gray-600 dark:text-gray-300 font-normal cursor-pointer select-none">
                                        {amenity}
                                    </label>
                                </div>
                            ))}`;

c = c.replace(badBlock, goodBlock);
fs.writeFileSync('components/explore/space-filters.tsx', c, 'utf8');
console.log('Fixed amenities in space-filters.tsx');
