const fs = require('fs');
const path = require('path');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
    convertInchesToTwip,
    Footer,
    Header,
    PageNumber,
    PageNumberFormat
} = require('docx');

// Brand Colors
const TEAL_PRIMARY = "008080";      // Main Brand Teal
const TEAL_DARK = "005959";         // Dark Teal
const TEAL_LIGHT = "E6F2F2";        // Light Teal Background
const CHARCOAL = "1A2020";          // Charcoal Black
const AMBER_ACCENT = "D97706";      // Amber/Gold Accent
const GRAY_BORDER = "CCCCCC";       // Border Gray
const GRAY_BG = "F7F9F9";           // Alternating row / box background
const TEXT_MUTED = "555555";

function createHeader(text, level = HeadingLevel.HEADING_1) {
    let size = 32;
    let color = TEAL_PRIMARY;
    let before = 360;
    let after = 140;

    if (level === HeadingLevel.HEADING_2) {
        size = 26;
        color = CHARCOAL;
        before = 260;
        after = 100;
    } else if (level === HeadingLevel.HEADING_3) {
        size = 22;
        color = TEAL_DARK;
        before = 180;
        after = 80;
    }

    return new Paragraph({
        heading: level,
        spacing: { before, after },
        children: [
            new TextRun({
                text,
                bold: true,
                color,
                size,
                font: "Calibri",
            }),
        ],
    });
}

function createParagraph(text, options = {}) {
    return new Paragraph({
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: { before: options.before || 60, after: options.after || 100, line: 260 },
        children: [
            new TextRun({
                text,
                bold: options.bold || false,
                italics: options.italics || false,
                color: options.color || "222222",
                size: options.size || 21,
                font: "Calibri",
            }),
        ],
    });
}

function createBullet(text, boldPrefix = "", options = {}) {
    const runs = [];
    if (boldPrefix) {
        runs.push(new TextRun({
            text: boldPrefix + " ",
            bold: true,
            color: options.prefixColor || CHARCOAL,
            size: 21,
            font: "Calibri",
        }));
    }
    runs.push(new TextRun({
        text,
        color: "333333",
        size: 21,
        font: "Calibri",
    }));

    return new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 60, line: 240 },
        children: runs,
    });
}

function createCallout(title, bodyLines, accentColor = TEAL_PRIMARY, bgColor = TEAL_LIGHT) {
    const cells = [
        new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: convertInchesToTwip(0.12), bottom: convertInchesToTwip(0.12), left: convertInchesToTwip(0.18), right: convertInchesToTwip(0.18) },
            borders: {
                left: { style: BorderStyle.SINGLE, size: 28, color: accentColor },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
            },
            children: [
                new Paragraph({
                    spacing: { before: 40, after: 60 },
                    children: [
                        new TextRun({
                            text: title,
                            bold: true,
                            size: 22,
                            color: accentColor,
                            font: "Calibri",
                        }),
                    ],
                }),
                ...bodyLines.map(line => new Paragraph({
                    spacing: { before: 30, after: 30 },
                    children: [
                        new TextRun({
                            text: line,
                            size: 20,
                            color: "222222",
                            font: "Calibri",
                        }),
                    ],
                })),
            ],
        }),
    ];

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: cells })],
    });
}

function createStyledTable(headers, rows, colWidths = []) {
    const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
            width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
            shading: { fill: TEAL_PRIMARY, type: ShadingType.CLEAR },
            margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.12), right: convertInchesToTwip(0.12) },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 8, color: TEAL_PRIMARY },
                bottom: { style: BorderStyle.SINGLE, size: 16, color: TEAL_DARK },
                left: { style: BorderStyle.SINGLE, size: 6, color: "FFFFFF" },
                right: { style: BorderStyle.SINGLE, size: 6, color: "FFFFFF" },
            },
            children: [
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: h,
                            bold: true,
                            color: "FFFFFF",
                            size: 20,
                            font: "Calibri",
                        }),
                    ],
                }),
            ],
        })),
    });

    const bodyRows = rows.map((row, rIndex) => {
        const bg = rIndex % 2 === 1 ? GRAY_BG : "FFFFFF";
        return new TableRow({
            children: row.map((cellText, cIndex) => new TableCell({
                width: colWidths[cIndex] ? { size: colWidths[cIndex], type: WidthType.PERCENTAGE } : undefined,
                shading: { fill: bg, type: ShadingType.CLEAR },
                margins: { top: convertInchesToTwip(0.08), bottom: convertInchesToTwip(0.08), left: convertInchesToTwip(0.12), right: convertInchesToTwip(0.12) },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER },
                    left: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER },
                    right: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER },
                },
                children: [
                    new Paragraph({
                        spacing: { before: 20, after: 20 },
                        children: [
                            new TextRun({
                                text: cellText,
                                size: 19,
                                color: "222222",
                                font: "Calibri",
                            }),
                        ],
                    }),
                ],
            })),
        });
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...bodyRows],
    });
}

function buildDocument() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: "Calibri", size: 21, color: "222222" },
                    paragraph: { spacing: { line: 260 } },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(0.85),
                            bottom: convertInchesToTwip(0.85),
                            left: convertInchesToTwip(0.85),
                            right: convertInchesToTwip(0.85),
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: { after: 120 },
                                children: [
                                    new TextRun({
                                        text: "GEENEY (MYGENIE) PLATFORM ARCHITECTURE & TERMS SPECIFICATION",
                                        size: 16,
                                        color: "888888",
                                        font: "Calibri",
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: "Confidential & Proprietary • Geeney Europe (mygenieurope.com) • Page ",
                                        size: 16,
                                        color: "888888",
                                        font: "Calibri",
                                    }),
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        size: 16,
                                        color: "888888",
                                        font: "Calibri",
                                    }),
                                    new TextRun({
                                        text: " of ",
                                        size: 16,
                                        color: "888888",
                                        font: "Calibri",
                                    }),
                                    new TextRun({
                                        children: [PageNumber.TOTAL_PAGES],
                                        size: 16,
                                        color: "888888",
                                        font: "Calibri",
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children: [
                    // Title Block
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 180, after: 60 },
                        children: [
                            new TextRun({
                                text: "GEENEY / MYGENIE PLATFORM",
                                size: 36,
                                bold: true,
                                color: TEAL_PRIMARY,
                                font: "Calibri",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 40, after: 120 },
                        children: [
                            new TextRun({
                                text: "COMPREHENSIVE ARCHITECTURE, OPERATIONAL RULES & FUNCTIONALITIES",
                                size: 24,
                                bold: true,
                                color: CHARCOAL,
                                font: "Calibri",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 20, after: 260 },
                        children: [
                            new TextRun({
                                text: "Master Technical Baseline for Terms & Conditions, Service Level Agreements & Privacy Policies",
                                size: 20,
                                italics: true,
                                color: AMBER_ACCENT,
                                font: "Calibri",
                            }),
                        ],
                    }),

                    createCallout(
                        "DOCUMENT STATUS & LEGAL PURPOSE",
                        [
                            "• Production Environment: Next.js 15 App Router, Prisma ORM, PostgreSQL, NextAuth.js, Google Maps Platform.",
                            "• Operating Domains: mygenieurope.com and associated regional gateways.",
                            "• Regulatory Context: European Union Digital Services Act (DSA), General Data Protection Regulation (GDPR), and Electronic Commerce Directives.",
                            "• Purpose: This document provides the authoritative, exhaustive technical architecture, data model relationships, business logic, commission rules, and lifecycle workflows required to draft and legally defend the platform's Terms and Conditions (T&C)."
                        ],
                        TEAL_PRIMARY,
                        TEAL_LIGHT
                    ),

                    new Paragraph({ spacing: { before: 160 } }),

                    // Section 1
                    createHeader("1. Executive Platform Overview", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Geeney (operating under the consumer brand MyGenie at mygenieurope.com) is a high-availability digital marketplace operating across the European Union. The platform enables two distinct commercial ecosystems: (a) on-demand commercial real estate booking (day offices, meeting rooms, photography/video studios, event venues, retail pop-ups, and storage warehouses), and (b) professional on-demand services (event catering, professional cleaning, event photography, audio/DJ entertainment, floral design & decoration, security, and equipment hire)."
                    ),
                    createParagraph(
                        "The platform functions strictly as an information society intermediary service connecting independent property owners and independent service professionals with business or consumer clients. Geeney does not own, lease, operate, or furnish the listed spaces, nor does it employ the service professionals."
                    ),

                    // Section 2
                    createHeader("2. User Personas & Contractual Roles", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Under the platform's security and authorization model (enforced via NextAuth and Prisma UserRole enums), every registered user belongs to one or more strict contractual classifications:"
                    ),
                    createBullet(
                        "An individual or legal entity seeking flexible short-term space rental or on-demand professional services. The Customer agrees to adhere to the space's access guidelines, occupancy limits, and safety standards, and commits to paying the total listed price.",
                        "A. Customer / Renter (Role: RENTER / CUSTOMER):"
                    ),
                    createBullet(
                        "An independent owner, leaseholder, or authorized property administrator who publishes commercial spaces. The Space Owner establishes pricing (hourly, daily, weekend), defines access methods (electronic keypad codes or on-site key exchange), and legally covenants to maintain hygiene and safety standards.",
                        "B. Space Owner (Role: OWNER):"
                    ),
                    createBullet(
                        "An independent professional artisan, contractor, or business entity providing specialized services. The Service Owner sets hourly billing rates, establishes working availability intervals (e.g., 09:00 - 18:00), defines custom categories, and engages in direct commercial billing with Customers under a zero-commission model.",
                        "C. Service Owner (Role: SERVICE_OWNER):"
                    ),
                    createBullet(
                        "Platform compliance officers and administrative staff with supervisory authority to audit identity verifications, inspect disputes via the PublicInquiry triage system, and enforce platform-wide safety standards.",
                        "D. Platform Administrator (Role: ADMIN):"
                    ),

                    // Section 3
                    createHeader("3. Dual-Core Listing Architecture: Spaces vs. Services", HeadingLevel.HEADING_1),
                    createParagraph(
                        "The platform implements a dual-core catalog model distinguishing physical real estate from professional services, while sharing unified discovery interfaces (interactive map, search filters, and catalog views):"
                    ),

                    createStyledTable(
                        ["Feature / Attribute", "Space Listing (Real Estate)", "Service Listing (Human Expertise)"],
                        [
                            ["Underlying Entity", "Physical immoveable property / workspace", "Independent contractor skill or business service"],
                            ["Catalog Distinction", "isService = false, listingType = 'SPACE'", "isService = true, listingType = 'SERVICE'"],
                            ["Categories", "Offices, Studios, Event Halls, Warehouses, Retail", "Preset (Catering, Cleaning, DJ, etc.) OR Custom Category"],
                            ["Description Field", "Standard markdown text (size, capacity, rules)", "Strict 500-character description with live UI counter"],
                            ["Geographic Mapping", "Precise address geocoded via Google Maps", "Service operational address / operational radius"],
                            ["Pricing Parameters", "Hourly Rate, Daily Rate, Weekend Rate", "Hourly Rate ONLY"],
                            ["Amenities", "WiFi, Kitchen, AC, Parking, Projector, Keypad", "Not applicable (service equipment managed by provider)"],
                            ["Availability Model", "Calendar date slots & hourly blocks", "Operating hours window (e.g. 09:00 - 18:00) + Active toggle"],
                            ["Owner Creation Trigger", "'+ Add New Space' button on owner dashboard", "'+ Add New Service' dedicated button on service hub"]
                        ],
                        [26, 37, 37]
                    ),

                    new Paragraph({ spacing: { before: 160 } }),

                    // Section 4
                    createHeader("4. Financial Architecture & Commission Framework", HeadingLevel.HEADING_1),
                    createParagraph(
                        "A critical legal and commercial foundation of Geeney is the fundamental asymmetry between space rentals and service bookings, governed by lib/pricing.ts:"
                    ),

                    createHeader("4.1 Space Rental Financial Mechanics (15% Platform Commission)", HeadingLevel.HEADING_2),
                    createBullet(
                        "The Space Owner defines the exact net revenue desired for their space: hourlyRate, dailyRate, and weekendRate.",
                        "Owner Rate Discretion:"
                    ),
                    createBullet(
                        "The platform charges a mandatory 15% platform commission on space bookings. Total Customer Price = Owner Rate * 1.15.",
                        "Platform Commission Formula:"
                    ),
                    createBullet(
                        "The 15% platform fee is bundled into the total price displayed across all public search views, map markers, and booking modals, ensuring complete fee transparency.",
                        "Customer Transparency:"
                    ),
                    createBullet(
                        "The Space Owner receives 100% of their set price. The platform collects the 15% fee to maintain security, infrastructure, contract generation, and customer support.",
                        "Owner Remittance:"
                    ),
                    createBullet(
                        "The Space Owner dashboard clearly displays an itemized split: [Total Amount (115%)] = [Owner Net Price (100%)] + [Platform Fee (15%)].",
                        "Dashboard Itemization:"
                    ),

                    createHeader("4.2 Service Bookings Financial Mechanics (0% Platform Commission)", HeadingLevel.HEADING_2),
                    createCallout(
                        "ZERO COMMISSION POLICY FOR SERVICES",
                        [
                            "• Absolute Rule: Geeney levies ZERO percent (0%) platform commission on service listings.",
                            "• Pricing Formula: Customer Total Price = Owner Price (commission = 0, platformFee = 0).",
                            "• Direct Client Settlement: Customers settle payments directly with Service Owners off-platform (cash, direct bank transfer, or invoice).",
                            "• Zero Intermediary Liability: Geeney does not process, escrow, or withhold funds for service bookings.",
                            "• UI Shielding: No platform fee badges, breakdowns, or commission calculations are displayed for service bookings."
                        ],
                        AMBER_ACCENT,
                        GRAY_BG
                    ),

                    // Section 5
                    createHeader("5. Booking Lifecycles & 3-Step State Machine", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Every reservation request follows an automated state transition engine recorded in the Prisma Booking model under the BookingStatus enum:"
                    ),

                    createHeader("5.1 Physical Space Booking Lifecycle (3-Step Progress)", HeadingLevel.HEADING_2),
                    createParagraph(
                        "For spaces, booking confirmation and access control require strict sequential verification:"
                    ),
                    createBullet(
                        "Customer selects an available date and time slot. The booking is created with status = 'PENDING'. The Space Owner receives an immediate real-time dashboard notification and email alert.",
                        "Step 1 — Pending for Confirmation (În așteptare pentru confirmare):"
                    ),
                    createBullet(
                        "The Space Owner reviews the customer profile and requested hours. The owner may (a) Approve, (b) Reject, or (c) Propose an Alternative Interval. Upon approval, status transitions to 'CONFIRMED'. The customer receives a payment notification.",
                        "Step 2 — Confirmed, Proceed with Payment (Confirmat — Continuă cu plata):"
                    ),
                    createBullet(
                        "The customer executes payment and submits proof of payment (transaction ID, bank receipt, or reference). Upon submission, the booking is locked as 'RESERVED'. At this exact moment, the space's confidential electronic access code (accessCode) is decrypted and revealed to the customer.",
                        "Step 3 — Reserved (Rezervat):"
                    ),

                    createHeader("5.2 Professional Service Booking Lifecycle (Streamlined Direct Confirmation)", HeadingLevel.HEADING_2),
                    createParagraph(
                        "Because services involve direct billing and immediate contractor confirmation, the lifecycle bypasses platform payment gates:"
                    ),
                    createBullet(
                        "Customer selects an available date and time within the provider's operating hours (e.g. 09:00 - 18:00). Status is set to 'PENDING'.",
                        "Step 1 — Pending for Confirmation (În așteptare pentru confirmare):"
                    ),
                    createBullet(
                        "When the Service Owner approves the request, the booking transitions DIRECTLY to Step 3 ('3. Rezervat'). Step 2 (payment proof) is completely bypassed. Both parties are notified that the reservation is confirmed, and direct communication unlocks.",
                        "Instant Step 3 — Reserved (Rezervat):"
                    ),

                    createStyledTable(
                        ["Lifecycle State", "Space Booking Behavior", "Service Booking Behavior"],
                        [
                            ["Initial Request", "Status: PENDING. Displays Step 1 active.", "Status: PENDING. Displays Step 1 active."],
                            ["Owner Approval", "Status: CONFIRMED. Enters Step 2 (payment required).", "Status: CONFIRMED. Instantly jumps to Step 3."],
                            ["Proof of Payment", "Mandatory requirement to unlock Step 3.", "Not required (0% fee, direct payment)."],
                            ["Step 3 Label", "3. Rezervat (Access code decrypted).", "3. Rezervat (Clean label, no proof brackets)."],
                            ["Access Codes", "Revealed only in Step 3.", "Not applicable (no access code required)."]
                        ],
                        [25, 38, 37]
                    ),

                    new Paragraph({ spacing: { before: 160 } }),

                    // Section 6
                    createHeader("6. Alternative Booking Interval Negotiation Framework", HeadingLevel.HEADING_1),
                    createParagraph(
                        "To prevent unnecessary booking cancellations when a space is occupied or undergoing maintenance, the platform implements an interactive alternative proposal engine:"
                    ),
                    createBullet(
                        "Instead of rejecting an inconvenient request, a Space Owner can specify a new proposed start date/time and end date/time via an inline calendar picker in the dashboard.",
                        "Owner Proposal Right:"
                    ),
                    createBullet(
                        "The booking status changes to 'OWNER_PROPOSED'. Proposed intervals (proposedStartTime, proposedEndTime) are persisted to the database.",
                        "State Transition:"
                    ),
                    createBullet(
                        "The customer dashboard displays a highlighted banner with the proposed hours. The customer can accept the new hours (which updates the booking) or cancel the request without penalty.",
                        "Customer Consent:"
                    ),

                    // Section 7
                    createHeader("7. Legally-Binding Digital Rental Contracts", HeadingLevel.HEADING_1),
                    createParagraph(
                        "The platform automatically synthesizes legally-binding rental agreements (/api/bookings/contract-preview) for all confirmed space reservations:"
                    ),
                    createBullet(
                        "At the time of submitting a booking request, the customer must check a mandatory terms acceptance checkbox. The server captures the exact timestamp (termsAcceptedAt) and IP address (termsAcceptedIp).",
                        "Digital Signature & IP Stamp:"
                    ),
                    createBullet(
                        "The generated contract dynamically injects the legal identities of the Space Owner and Customer, the registered space address, the exact reservation duration, the agreed pricing breakdown, and emergency contact details.",
                        "Contractual Injections:"
                    ),
                    createBullet(
                        "The agreement stipulates that the space is leased exclusively for the purpose stated in the booking, prohibits subleasing or illegal activities, and establishes customer liability for property damage.",
                        "Enforceability Clauses:"
                    ),

                    // Section 8
                    createHeader("8. Communication Lifecycles, Automated Timers & Privacy", HeadingLevel.HEADING_1),
                    createParagraph(
                        "The platform provides an encrypted messaging system (app/messages and Conversation/ChatMessage models) designed to balance user convenience with privacy and anti-harassment safeguards:"
                    ),

                    createStyledTable(
                        ["Messaging Parameter", "Space Rental Conversations", "Professional Service Conversations"],
                        [
                            ["Activation Trigger", "Created upon booking confirmation", "Created upon booking confirmation"],
                            ["Automated 24h Reminder", "Sent 24 hours prior to check-in (access code details)", "DISABLED (No automated messages)"],
                            ["Automated 12h Reminder", "Sent 12 hours prior to check-in (arrival logistics)", "DISABLED (No automated messages)"],
                            ["Communication Mode", "Structured logistics & property rules", "Free, unrestricted profile-to-profile communication"],
                            ["Active Chat Duration", "Active from confirmation until 48 hours post check-out", "Active from confirmation until 24 hours post service date"],
                            ["Expiration Trigger", "endTime + 48 hours (Lockout enforced by API)", "endTime + 24 hours (Lockout enforced by API)"],
                            ["Post-Expiration State", "Read-only archive; new message POST rejected with 400", "Read-only archive; new message POST rejected with 400"]
                        ],
                        [24, 38, 38]
                    ),

                    new Paragraph({ spacing: { before: 160 } }),

                    // Section 9
                    createHeader("9. Hygiene Standards & Mandatory Self-Cleaning Covenant", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Pursuant to European and national public health regulations for shared commercial spaces, Geeney enforces a mandatory hygiene covenant for all listed properties:"
                    ),
                    createBullet(
                        "Every Space Owner must explicitly toggle and agree to the selfCleaning covenant prior to publishing any space listing.",
                        "Mandatory Owner Covenant:"
                    ),
                    createBullet(
                        "'I commit to thoroughly clean and disinfect the space before and after every booking in accordance with applicable sanitary and hygiene regulations.'",
                        "Statutory Hygiene Affirmation:"
                    ),
                    createBullet(
                        "If a space is reported for unsanitary conditions via the PublicInquiry triage system, the platform reserves the right to suspend the listing and withhold pending payouts pending physical inspection.",
                        "Breach of Covenant:"
                    ),

                    // Section 10
                    createHeader("10. Referral Engine & 'Genie Levels' Rules", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Geeney incorporates a viral referral engine (ReferralCode and Referral models) governed by strict qualification and anti-abuse terms:"
                    ),
                    createBullet(
                        "Each registered user receives a unique, unalterable alphanumeric referral code to share with third parties.",
                        "Unique Referral Tracking:"
                    ),
                    createBullet(
                        "A referral is marked 'CONFIRMED' only when (a) a referred Customer completes their first paid reservation, or (b) a referred Space Owner successfully publishes an active, approved listing.",
                        "Two-Way Qualification:"
                    ),
                    createBullet(
                        "Level 0 (0 referrals), Level 1 (1-2 referrals), Level 2 (3-5 referrals), Level 3 (6-9 referrals), Level 4 (10-19 referrals), Level 5 (20+ referrals). Higher tiers unlock fee discounts, priority search placement, and partner perks.",
                        "Tiered Progression (Genie Levels 0 to 5):"
                    ),
                    createBullet(
                        "Self-referrals, automated script registrations, and fake profile loops are detected via device fingerprinting and IP correlation, triggering immediate account ban and forfeiture of all referral perks.",
                        "Anti-Fraud Provisions:"
                    ),

                    // Section 11
                    createHeader("11. Security, Fraud Prevention & Public Support Inquiries", HeadingLevel.HEADING_1),
                    createParagraph(
                        "To protect platform integrity and comply with the EU Digital Services Act, Geeney maintains an always-accessible support and fraud reporting system (PublicInquiry):"
                    ),
                    createBullet(
                        "A permanent floating support button is present on all public and authenticated platform pages.",
                        "Universal Accessibility:"
                    ),
                    createBullet(
                        "Users can submit inquiries across three strict categories: (1) HOW_IT_WORKS, (2) PAYMENT_ISSUES, and (3) FRAUD_REPORT (maximum 400 characters).",
                        "Category Classification:"
                    ),
                    createBullet(
                        "Inquiries are triaged in real time at /admin/dashboard. Administrators can view user details, inspect context, mark inquiries as seen, and transmit formal written replies.",
                        "Administrative SLA:"
                    ),

                    // Section 12
                    createHeader("12. Data Privacy, GDPR & Contact Disclosure Rules", HeadingLevel.HEADING_1),
                    createParagraph(
                        "Geeney adheres to Regulation (EU) 2016/679 (GDPR). The operational data flow enforces strict purpose limitation and data minimization:"
                    ),
                    createBullet(
                        "Public visitors and unconfirmed users cannot view personal contact details of space or service owners.",
                        "Contact Concealment:"
                    ),
                    createBullet(
                        "Upon booking confirmation (CONFIRMED or RESERVED), the platform discloses the Customer's name, email, and phone number to the Space/Service Owner solely for coordination purposes under GDPR Article 6(1)(b) (performance of a contract).",
                        "Necessary Operational Disclosure:"
                    ),
                    createBullet(
                        "Users possess full statutory rights under Articles 15-21 GDPR (access, rectification, erasure, and portability) manageable via the platform privacy portal.",
                        "User Rights:"
                    ),

                    // Section 13
                    createHeader("13. Multilingual Parity & Governing Law", HeadingLevel.HEADING_1),
                    createParagraph(
                        "To guarantee consumer protection across international borders, the entire user experience and contractual terms maintain 100% key-for-key parity across four official languages: Romanian (ro), English (en), Hungarian (hu), and German (de)."
                    ),
                    createParagraph(
                        "In the event of linguistic discrepancies, the English version shall serve as the official interpretive baseline. These terms and conditions are governed by and construed in accordance with the laws of the European Union member state of platform incorporation, without prejudice to mandatory local consumer protection statutes."
                    ),

                    new Paragraph({ spacing: { before: 240 } }),

                    createCallout(
                        "TECHNICAL APPENDIX: CORE PRISMA DATA MODELS",
                        [
                            "• User: id, email, password, role [OWNER, RENTER, ADMIN, SERVICE_OWNER], verified, subscriptionTier, referralCode.",
                            "• Space: id, ownerId, name, description, address, city, latitude, longitude, hourlyRate, dailyRate, weekendRate, isService, serviceCategory, availableHours, selfCleaning, accessCode.",
                            "• Booking: id, spaceId, renterId, startTime, endTime, isHourly, basePrice, cleaningFee, totalPrice, commission, ownerEarnings, adminEarnings, status [PENDING, OWNER_PROPOSED, CONFIRMED, RESERVED, REJECTED, COMPLETED], termsAcceptedAt, termsAcceptedIp.",
                            "• Conversation & ChatMessage: id, bookingId, spaceId, ownerId, customerId, status, messages [content, isAutomated, automatedType, senderRole, readByCustomer, readByOwner].",
                            "• PublicInquiry: id, category [HOW_IT_WORKS, PAYMENT_ISSUES, FRAUD_REPORT], message, email, isSeen, replyText, repliedAt."
                        ],
                        TEAL_DARK,
                        GRAY_BG
                    ),
                ],
            },
        ],
    });

    return doc;
}

async function main() {
    const doc = buildDocument();
    const buffer = await Packer.toBuffer(doc);

    // Target 1: Workspace root
    const workspacePath = path.join(__dirname, '..', 'Geeney_Architecture_and_Platform_Rules_Terms_Base.docx');
    fs.writeFileSync(workspacePath, buffer);
    console.log(`Document created at: ${workspacePath}`);

    // Target 2: Artifact directory
    const artifactDir = 'C:\\Users\\racas\\.gemini\\antigravity\\brain\\9c982286-d058-4550-a25a-75f625c71147';
    if (fs.existsSync(artifactDir)) {
        const artifactPath = path.join(artifactDir, 'Geeney_Architecture_and_Platform_Rules_Terms_Base.docx');
        fs.writeFileSync(artifactPath, buffer);
        console.log(`Artifact copy created at: ${artifactPath}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
