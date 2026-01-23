# GDPR & Compliance Checklist

## General Data Protection Regulation (GDPR) Compliance

### Data Collection & Consent
- [ ] Clear privacy policy in Czech and English
- [ ] Explicit consent checkboxes during registration
- [ ] Cookie consent banner (if using non-essential cookies)
- [ ] Age verification (minimum 16 years, or 13 with parental consent)
- [ ] Purpose limitation - only collect necessary data

### User Rights Implementation
- [ ] **Right to Access**: Users can download their data
  - API endpoint: `/api/user/data-export`
  - Includes: profile, bookings, reviews, payments
- [ ] **Right to Rectification**: Users can update their information
  - Profile edit functionality
- [ ] **Right to Erasure**: Users can request account deletion
  - API endpoint: `/api/user/delete-account`
  - Data retention policy (7 years for financial records)
- [ ] **Right to Data Portability**: Export in machine-readable format (JSON)
- [ ] **Right to Object**: Opt-out of marketing communications

### Data Security
- [ ] Encryption at rest (database encryption)
- [ ] Encryption in transit (HTTPS/TLS)
- [ ] Password hashing (bcrypt with salt)
- [ ] Secure session management
- [ ] Regular security audits
- [ ] Data breach notification procedure (72-hour rule)

### Data Processing
- [ ] Data Processing Agreement (DPA) with third parties:
  - Stripe (payment processing)
  - Google (Maps, OAuth)
  - Email provider
  - SMS provider
- [ ] Data minimization principle
- [ ] Purpose limitation
- [ ] Storage limitation (automatic data deletion after retention period)

### Documentation
- [ ] Privacy Policy (Czech + English)
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Data Processing Register
- [ ] Consent records

---

## Payment Services Directive 2 (PSD2) Compliance

### Strong Customer Authentication (SCA)
- [ ] **Initial Payment Setup**: SCA required for first payment
  - Implemented via Stripe's 3D Secure 2.0
  - Bank redirect or fingerprint/Face ID
- [ ] **Recurring Payments**: MIT (Merchant-Initiated Transactions) exempt from SCA
- [ ] **One-time payments**: SCA on every transaction

### Implementation Checklist
- [ ] Stripe SCA integration
- [ ] Customer authentication during card setup
- [ ] Fallback for failed authentication
- [ ] Transaction risk analysis (TRA) exemptions where applicable

---

## SEPA Direct Debit Compliance

### Mandate Requirements
- [ ] **Written Mandate**: Electronic or paper authorization
  - Customer name, address, bank details
  - Mandate reference (unique identifier)
  - Creditor identifier
  - Signature (electronic via 3DS/SCA or physical)
- [ ] **Mandate Storage**: Secure storage for audit purposes
- [ ] **Mandate Cancellation**: Customer can cancel anytime

### Pre-Notification
- [ ] Notify customer **14 days before** first debit (can be shortened to 2-5 days with agreement)
- [ ] Include in notification:
  - Amount to be debited
  - Debit date
  - Mandate reference
  - Creditor information

### Customer Rights
- [ ] **Refund Period**: Customers can request refund within 8 weeks, no questions asked
- [ ] **Unauthorized Debit**: Refund within 13 months for unauthorized transactions
- [ ] No chargeback rights for merchants in SEPA Core scheme

### Currency
- [ ] SEPA only supports **EUR** (not CZK)
  - Platform must handle EUR for SEPA payments
  - Offer CZK for card payments
  - Clear currency conversion rates

### Implementation
- [ ] SEPA mandate collection form
- [ ] Pre-notification email template
- [ ] Refund request handling
- [ ] Mandate management dashboard

---

## Czech Republic Specific Regulations

### Business Registration
- [ ] Register platform as a business entity in Czech Republic
- [ ] VAT registration (if applicable)
- [ ] Data controller registration with ÚOOÚ (Czech DPA)

### Tax Compliance
- [ ] Collect VAT on platform commission (21% standard rate)
- [ ] Issue invoices for all transactions
- [ ] Monthly/quarterly VAT reporting
- [ ] Annual tax returns

### Consumer Protection
- [ ] 14-day cooling-off period for consumers (not applicable for completed services)
- [ ] Clear terms and conditions in Czech language
- [ ] Dispute resolution mechanism
- [ ] Contact information readily available

### Labor Law (for Cleaning Companies)
- [ ] Ensure cleaning companies are registered businesses
- [ ] Platform is not employer of cleaners
- [ ] Independent contractor agreements

---

## Financial Compliance

### Anti-Money Laundering (AML)
- [ ] Know Your Customer (KYC) procedures
  - ID verification for high-value transactions (>€1,000)
- [ ] Transaction monitoring
- [ ] Suspicious activity reporting

### Payment Institution Requirements
- [ ] Determine if platform qualifies as payment institution
  - If only facilitating, likely exempt
  - If holding funds, may need license
- [ ] Partner with licensed payment processor (Stripe)

---

## Platform-Specific Compliance

### Marketplace Liability
- [ ] Clear terms: Platform is intermediary, not party to rental contract
- [ ] Insurance requirements for operators
- [ ] Property damage liability
- [ ] Safety and health standards

### Rental Regulations (Czech Real Estate)
- [ ] Weekend-only rentals may require specific licensing
- [ ] Building permits for commercial use
- [ ] Fire safety compliance
- [ ] Accessibility standards (if applicable)

### Insurance
- [ ] Platform liability insurance
- [ ] Professional indemnity insurance
- [ ] Cyber security insurance

---

## Technical Compliance

### Accessibility (Web Content Accessibility Guidelines)
- [ ] WCAG 2.1 Level AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast standards

### Cookie Compliance
- [ ] Only essential cookies without consent
- [ ] Cookie consent for analytics, marketing
- [ ] Cookie policy documentation

---

## Ongoing Compliance Tasks

### Monthly
- [ ] Review data processing activities
- [ ] Monitor failed SCA authentications
- [ ] Review SEPA refund requests
- [ ] Update consent records

### Quarterly
- [ ] Security audit
- [ ] Review third-party DPAs
- [ ] Update privacy policy if needed
- [ ] Compliance training for team

### Annually
- [ ] GDPR compliance audit
- [ ] Renew insurance policies
- [ ] Review and update T&Cs
- [ ] Financial audit
- [ ] Penetration testing

---

## Contacts & Resources

### Regulatory Bodies
- **Czech Data Protection Authority (ÚOOÚ)**: https://www.uoou.cz/
- **Czech National Bank (ČNB)**: https://www.cnb.cz/ (payment regulations)
- **European Banking Authority (EBA)**: https://www.eba.europa.eu/ (PSD2 guidance)

### Legal Counsel
- Recommend: Engage Czech attorney specializing in:
  - Data protection law
  - Fintech/payment regulations
  - Real estate and rental law

### Technical Resources
- Stripe Compliance: https://stripe.com/docs/strong-customer-authentication
- GDPR Portal: https://gdpr.eu/
- SEPA Rulebook: https://www.europeanpaymentscouncil.eu/

---

## Implementation Priority

### Phase 1 (Before Launch)
1. Privacy Policy & Terms (legal review)
2. GDPR consent mechanisms
3. Stripe SCA integration
4. Data encryption
5. User rights endpoints (data export/delete)

### Phase 2 (First 30 Days)
1. SEPA mandate system
2. Full KYC implementation
3. AML procedures
4. Insurance policies

### Phase 3 (Ongoing)
1. Regular audits
2. Compliance monitoring
3. User education
4. Process improvements

---

**Note**: This checklist is for guidance only. Consult with legal and compliance professionals before production deployment.
