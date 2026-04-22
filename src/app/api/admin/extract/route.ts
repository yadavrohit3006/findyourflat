import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const EXTRACT_PROMPT = `You are analyzing a flat/apartment rental listing from India.
Extract the listing details and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Return this exact JSON structure (use null for unknown/missing fields):
{
  "title": "short descriptive title (5-120 chars)",
  "description": "full description text if available, else null",
  "rentMonthly": <integer monthly rent in INR, null if unknown>,
  "listingType": "NEW_LISTING" or "REPLACEMENT" (REPLACEMENT if someone is moving out and looking for a flatmate to replace them),
  "flatType": "1RK" or "1BHK" or "2BHK" or "3BHK" or "4BHK" or null,
  "furnishingStatus": "UNFURNISHED" or "SEMI_FURNISHED" or "FULLY_FURNISHED" or null,
  "genderPreference": "ANY" or "MALE_ONLY" or "FEMALE_ONLY",
  "availableFrom": "YYYY-MM-DD" or null (if immediately available use today: 2026-04-23),
  "contactName": "person's name or null",
  "contactPhone": "exactly 10 digits, no spaces/+91 prefix, or null",
  "contactEmail": "email address or null",
  "address": "street address or area description",
  "city": "city name",
  "neighborhood": "locality/area name or null"
}`;

function extractTextFromHTML(html: string): string {
  // Extract og: meta tags
  const getMeta = (prop: string) => {
    const m =
      html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${prop}["']`, 'i'));
    return m?.[1] ?? '';
  };

  const title = getMeta('og:title');
  const description = getMeta('og:description');

  // Strip tags and collapse whitespace
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);

  return [title && `Title: ${title}`, description && `Description: ${description}`, bodyText]
    .filter(Boolean)
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  let body: { imageBase64?: string; imageMediaType?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  let messageContent: Anthropic.MessageParam['content'];

  if (body.imageBase64 && body.imageMediaType) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(body.imageMediaType)) {
      return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }
    messageContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: body.imageMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: body.imageBase64,
        },
      },
      { type: 'text', text: EXTRACT_PROMPT },
    ];
  } else if (body.url) {
    let pageText: string;
    try {
      const response = await fetch(body.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = await response.text();
      pageText = extractTextFromHTML(html);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        {
          error: `Could not fetch that URL (${msg}). Facebook/WhatsApp links require login — please upload a screenshot instead.`,
        },
        { status: 400 }
      );
    }

    messageContent = [
      {
        type: 'text',
        text: `Here is the text content from the listing page:\n\n${pageText}\n\n${EXTRACT_PROMPT}`,
      },
    ];
  } else {
    return NextResponse.json({ error: 'Provide either imageBase64 or url' }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: messageContent }],
    });

    const text = (response.content[0] as { type: 'text'; text: string }).text.trim();

    // Strip markdown code fences if Claude added them
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    const extracted = JSON.parse(jsonStr);
    return NextResponse.json(extracted);
  } catch (err) {
    console.error('[extract] Claude/parse error:', err);
    return NextResponse.json({ error: 'Failed to extract listing details. Please try again.' }, { status: 500 });
  }
}
