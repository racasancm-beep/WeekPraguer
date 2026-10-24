const fs = require('fs');

// 1. Update components/explore/space-filters.tsx to accept initial props
let filters = fs.readFileSync('components/explore/space-filters.tsx', 'utf8');

filters = filters.replace(
`export function SpaceFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isServiceMode = searchParams.get("type") === "servicii" || searchParams.get("category") === "servicii" || searchParams.get("q")?.toLowerCase() === "servicii";

    const [city, setCity] = useState(searchParams.get("city") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [query, setQuery] = useState(searchParams.get("q") && searchParams.get("q")?.toLowerCase() !== "servicii" ? searchParams.get("q")! : "");`,
`interface SpaceFiltersProps {
    initialType?: string;
    initialCategory?: string;
    initialQuery?: string;
    initialCity?: string;
}

export function SpaceFilters({ initialType, initialCategory, initialQuery, initialCity }: SpaceFiltersProps = {}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentType = searchParams.get("type") || initialType;
    const currentQ = searchParams.get("q") || initialQuery;
    const isServiceMode = currentType === "servicii" || searchParams.get("category") === "servicii" || (currentQ && currentQ.toLowerCase() === "servicii");

    const [city, setCity] = useState(searchParams.get("city") || initialCity || "");
    const [category, setCategory] = useState(searchParams.get("category") || initialCategory || "");
    const [query, setQuery] = useState(currentQ && currentQ.toLowerCase() !== "servicii" ? currentQ : "");`
);

fs.writeFileSync('components/explore/space-filters.tsx', filters, 'utf8');
console.log('SpaceFilters props updated');

// 2. Update app/explore/page.tsx
let explore = fs.readFileSync('app/explore/page.tsx', 'utf8');
explore = explore.replace(
`<SpaceFilters />`,
`<SpaceFilters
    initialType={params.type as string}
    initialCategory={params.category as string}
    initialQuery={params.q as string}
    initialCity={params.city as string}
/>`
);

fs.writeFileSync('app/explore/page.tsx', explore, 'utf8');
console.log('Explore page props passed to SpaceFilters');
