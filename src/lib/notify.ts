const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'rohit.yadav@bachatt.app';
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://findyourflat.vercel.app';

interface NewListingPayload {
  id: string;
  title: string;
  city: string;
  neighborhood?: string | null;
  rentMonthly: number;
  flatType: string;
  listingType: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

const FLAT_TYPE: Record<string, string> = {
  '1RK': '1 RK', '1BHK': '1 BHK', '2BHK': '2 BHK',
  '3BHK': '3 BHK', '4BHK': '4 BHK',
};
const LISTING_TYPE: Record<string, string> = {
  NEW_LISTING: 'New Listing', REPLACEMENT: 'Replacement',
};

export async function notifyNewListing(listing: NewListingPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('[notify] RESEND_API_KEY not set — skipping email notification');
    return;
  }

  const location = [listing.neighborhood, listing.city].filter(Boolean).join(', ');
  const rent = `₹${listing.rentMonthly.toLocaleString('en-IN')}/mo`;
  const adminUrl = `${APP_URL}/admin/listings`;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#0284c7;padding:24px 28px;">
      <p style="margin:0;color:#bae6fd;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">FindYourFlat</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700;">New listing pending approval</h1>
    </div>
    <div style="padding:24px 28px;">
      <h2 style="margin:0 0 4px;font-size:16px;font-weight:600;color:#111827;">${listing.title}</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">${location}</p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:40%;">Rent</td>
          <td style="padding:8px 0;font-weight:600;color:#0284c7;">${rent}</td>
        </tr>
        <tr style="border-top:1px solid #f3f4f6;">
          <td style="padding:8px 0;color:#6b7280;">Type</td>
          <td style="padding:8px 0;color:#111827;">${LISTING_TYPE[listing.listingType] ?? listing.listingType} · ${FLAT_TYPE[listing.flatType] ?? listing.flatType}</td>
        </tr>
        ${listing.contactName ? `
        <tr style="border-top:1px solid #f3f4f6;">
          <td style="padding:8px 0;color:#6b7280;">Contact</td>
          <td style="padding:8px 0;color:#111827;">${listing.contactName}</td>
        </tr>` : ''}
        ${listing.contactPhone ? `
        <tr style="border-top:1px solid #f3f4f6;">
          <td style="padding:8px 0;color:#6b7280;">Phone</td>
          <td style="padding:8px 0;color:#111827;">${listing.contactPhone}</td>
        </tr>` : ''}
        ${listing.contactEmail ? `
        <tr style="border-top:1px solid #f3f4f6;">
          <td style="padding:8px 0;color:#6b7280;">Email</td>
          <td style="padding:8px 0;color:#111827;">${listing.contactEmail}</td>
        </tr>` : ''}
      </table>

      <a href="${adminUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0284c7;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
        Review &amp; Approve →
      </a>
    </div>
    <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">This listing is not live until you approve it in the admin dashboard.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `FindYourFlat <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `New listing pending approval — ${listing.title} (${location})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[notify] Resend error:', err);
    }
  } catch (err) {
    console.error('[notify] Failed to send notification email:', err);
  }
}
