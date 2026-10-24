const fs = require('fs');
let c = fs.readFileSync('app/spaces/[id]/page.tsx', 'utf8');

c = c.replace('const [bookedDates, setBookedDates] = useState<Date[]>([]);', 'const [bookedDates, setBookedDates] = useState<Date[]>([]);\n    const [existingBookings, setExistingBookings] = useState<any[]>([]);');

c = c.replace('const dates = bData.map((b: any) => new Date(b.startTime));', 'setExistingBookings(bData);\n                const dates = bData.map((b: any) => new Date(b.startTime));');

const optionsCode = `{Array.from({ length: 14 }).map((_, i) => {
    const hourNum = 8 + i;
    const h = hourNum.toString().padStart(2, "0") + ":00";
    const isBooked = existingBookings.some(b => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        if (bStart.toISOString().split('T')[0] === key) {
            const bStartHour = bStart.getUTCHours();
            const bEndHour = bEnd.getUTCHours();
            return hourNum >= bStartHour && hourNum < bEndHour;
        }
        return false;
    });
    return <option key={h} value={h} disabled={isBooked}>{h} {isBooked ? '(Booked)' : ''}</option>;
})}`;

const endTimeOptionsCode = `{Array.from({ length: 14 }).map((_, i) => {
    const hourNum = 9 + i;
    const h = hourNum.toString().padStart(2, "0") + ":00";
    const isBooked = existingBookings.some(b => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        if (bStart.toISOString().split('T')[0] === key) {
            const bStartHour = bStart.getUTCHours();
            const bEndHour = bEnd.getUTCHours();
            return (hourNum - 1) >= bStartHour && (hourNum - 1) < bEndHour;
        }
        return false;
    });
    return <option key={h} value={h} disabled={isBooked}>{h} {isBooked ? '(Booked)' : ''}</option>;
})}`;

c = c.replace(/\{Array\.from\(\{ length: 14 \}\)\.map\(\(\_, i\) => \{\s*const h = \(8 \+ i\)\.toString\(\)\.padStart\(2, "0"\) \+ ":00";\s*return <option key=\{h\} value=\{h\}>\{h\}<\/option>;\s*\}\)\}/g, optionsCode);

c = c.replace(/\{Array\.from\(\{ length: 14 \}\)\.map\(\(\_, i\) => \{\s*const h = \(9 \+ i\)\.toString\(\)\.padStart\(2, "0"\) \+ ":00";\s*return <option key=\{h\} value=\{h\}>\{h\}<\/option>;\s*\}\)\}/g, endTimeOptionsCode);

fs.writeFileSync('app/spaces/[id]/page.tsx', c);
