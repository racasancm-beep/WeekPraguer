const fs = require('fs');

let content = fs.readFileSync('lib/i18n/language-context.tsx', 'utf8');

const roServices = `        "spaces.count": "spații",

        // Services
        "services.title": "Servicii",
        "services.subtitle": "Găsește servicii profesionale dedicate pentru spațiul sau evenimentul tău",
        "services.viewAll": "Vezi toate serviciile",
        "services.cleaning": "Curățenie & Igienizare",
        "services.cleaning.desc": "Igienizare completă înainte și după evenimente sau sesiuni foto",
        "services.catering": "Catering & Protocol",
        "services.catering.desc": "Coffee break, gustări, meniuri calde și servire dedicată",
        "services.tech": "Echipamente & Suport Tehnic",
        "services.tech.desc": "Sisteme audio-video, lumini, ecrane LED și asistență pe durata evenimentului",
        "services.count": "servicii",
        "services.top10Title": "Top 10 Servicii Populare",
        "services.top10Subtitle": "Cele mai căutate și apreciate servicii suplimentare de pe platformă",`;

const enServices = `        "spaces.count": "spaces",

        // Services
        "services.title": "Services",
        "services.subtitle": "Find professional services dedicated to your space or event",
        "services.viewAll": "View all services",
        "services.cleaning": "Cleaning & Sanitation",
        "services.cleaning.desc": "Complete cleaning before and after events or shooting sessions",
        "services.catering": "Catering & Protocol",
        "services.catering.desc": "Coffee breaks, finger food, hot meals, and dedicated staffing",
        "services.tech": "AV Equipment & Tech Support",
        "services.tech.desc": "Sound systems, stage lighting, LED screens, and on-site event assistance",
        "services.count": "services",
        "services.top10Title": "Top 10 Most Popular Services",
        "services.top10Subtitle": "The most booked and requested add-on services across the platform",`;

const huServices = `        "spaces.count": "helyszín",

        // Services
        "services.title": "Szolgáltatások",
        "services.subtitle": "Találj professzionális szolgáltatásokat a helyszínedhez vagy rendezvényedhez",
        "services.viewAll": "Összes szolgáltatás",
        "services.cleaning": "Takarítás és Fertőtlenítés",
        "services.cleaning.desc": "Teljes körű takarítás rendezvények vagy fotózások előtt és után",
        "services.catering": "Catering és Vendéglátás",
        "services.catering.desc": "Kávészünet, falatkák, meleg ételek és dedikált személyzet",
        "services.tech": "Technikai és Hangtechnikai Eszközök",
        "services.tech.desc": "Hangtechnika, fények, LED falak és helyszíni technikai asszisztencia",
        "services.count": "szolgáltatás",
        "services.top10Title": "Top 10 Legnépszerűbb Szolgáltatás",
        "services.top10Subtitle": "A leggyakrabban igényelt kiegészítő szolgáltatások",`;

const deServices = `        "spaces.count": "räume",

        // Services
        "services.title": "Dienstleistungen",
        "services.subtitle": "Finden Sie professionelle Dienstleistungen für Ihren Raum oder Event",
        "services.viewAll": "Alle Services ansehen",
        "services.cleaning": "Reinigung & Hygiene",
        "services.cleaning.desc": "Umfassende Reinigung vor und nach Veranstaltungen oder Shootings",
        "services.catering": "Catering & Bewirtung",
        "services.catering.desc": "Kaffeepausen, Fingerfood, Menüs und professioneller Service",
        "services.tech": "Technik & AV-Ausstattung",
        "services.tech.desc": "Tonanlagen, Eventbeleuchtung, LED-Wände und technischer Support vor Ort",
        "services.count": "Services",
        "services.top10Title": "Top 10 Beliebteste Services",
        "services.top10Subtitle": "Die am häufigsten gebuchten Zusatzleistungen auf der Plattform",`;

content = content.replace('"spaces.count": "spații",', roServices);
content = content.replace('"spaces.count": "spaces",', enServices);
content = content.replace('"spaces.count": "helyszín",', huServices);
content = content.replace('"spaces.count": "räume",', deServices);

fs.writeFileSync('lib/i18n/language-context.tsx', content, 'utf8');
console.log('Translations updated successfully');
