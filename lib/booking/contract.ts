export function generateContract(
  renterName: string,
  ownerName: string,
  spaceName: string,
  totalPrice: number,
  startDate: string,
  endDate: string
) {
  const date = new Date().toLocaleDateString();

  return `
RENTAL AGREEMENT

Date: ${date}

1. PARTIES
This Agreement is between:
Landlord (Space Owner): ${ownerName || "Space Owner"}
Tenant (Renter): ${renterName || "Renter"}

2. PREMISES
Space: ${spaceName}

3. TERMS
Start Date: ${startDate}
End Date: ${endDate}
Total Fee: RON${totalPrice}

4. USAGE
The Tenant agrees to use the premises solely for the agreed purpose.
The Tenant agrees to vacate the premises by the End Date.
Quiet hours are strictly enforced between 22:00 and 06:00.

5. LIABILITY
The Tenant is liable for any damages caused to the property during the rental period.

6. ACCEPTANCE
By checking the "I Agree" box on the MyGenie platform, the Tenant accepts these terms digitally.
  `;
}
