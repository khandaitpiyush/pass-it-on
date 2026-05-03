import Groq from 'groq-sdk';

// ─────────────────────────────────────────────────────────────────────────────
// GROQ CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// PII STRIPPER
// Redacts personal data BEFORE it leaves your server to Groq.
// The stripped text is used for one Groq request only — never stored.
// ─────────────────────────────────────────────────────────────────────────────

const STRIP_RULES = [
  // Indian mobile numbers (+91 / 0 prefix optional)
  { pattern: /(\+91[\s\-]?|^0)?[6-9]\d{9}/g,                              replacement: '[PHONE]'   },
  // UPI IDs  (anything@bankhandle)
  { pattern: /[\w.\-]+@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|ibl|axl|upi|apl|barodampay|rajgovhdfcbank|pingpay|idbi|kotak|federal|indus|aubank|sbi|icici|hdfc|axis)/gi, replacement: '[UPI_ID]' },
  // Generic handle@word that wasn't caught above (catches custom UPI / emails)
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,        replacement: '[EMAIL]'   },
  // HTTP/HTTPS URLs and UPI deep-links
  { pattern: /https?:\/\/[^\s]+|upi:\/\/[^\s]+/gi,                        replacement: '[LINK]'    },
  // Aadhaar (12 digits, optional spaces/hyphens between groups of 4)
  { pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,                       replacement: '[AADHAAR]' },
  // Bank account / card numbers (9–18 digit standalone numbers)
  { pattern: /\b\d{9,18}\b/g,                                              replacement: '[NUMBER]'  },
  // WhatsApp / Telegram / social handles that could be off-platform lures
  { pattern: /(?:wa\.me|t\.me|telegram\.me)\/[^\s]+/gi,                   replacement: '[SOCIAL_LINK]' },
];

const stripPII = (text) =>
  STRIP_RULES.reduce((str, { pattern, replacement }) =>
    str.replace(pattern, replacement), text);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a scam detection classifier for PassItOn, a college campus marketplace
where students buy and sell second-hand items like books, electronics, and cycles.

Messages you receive have already been anonymized on the server:
  [PHONE]       = phone number
  [EMAIL]       = email address
  [UPI_ID]      = UPI payment handle
  [LINK]        = URL or payment deep-link
  [NUMBER]      = long numeric ID (bank account, card, etc.)
  [AADHAAR]     = government ID number
  [SOCIAL_LINK] = WhatsApp / Telegram invite link

Detect ONLY these four scam patterns:

  payment       — sharing [UPI_ID], [LINK], or [NUMBER] in a payment context;
                  asking for advance / token money before meetup
  off_platform  — asking to move the conversation to WhatsApp, Telegram,
                  phone call, or email (indicated by [PHONE], [EMAIL], [SOCIAL_LINK])
  urgency       — pressure language: "send now", "only today", "last chance",
                  threats, countdown language
  price_change  — changing the agreed price, adding hidden charges after deal

Risk levels:
  warn  → anything suspicious, scammy, or potentially harmful to the buyer.
          This includes asking for advance payment, sharing payment handles,
          pressure tactics, off-platform requests, or price manipulation.
  safe  → nothing suspicious (normal campus conversation, meetup coordination,
          price negotiation, questions about the item)

Calibration rules — read carefully:
  - Normal campus meetup coordination is SAFE ("meet me at gate 2 at 5pm")
  - In-person cash on delivery is SAFE
  - Asking for any advance / token money = warn
  - Sharing a UPI ID or payment link = warn
  - Any off-platform request ([PHONE], [EMAIL], [SOCIAL_LINK]) = warn
  - Pressure language ("send now", "last chance", "or I'll cancel") = warn
  - When in doubt, prefer safe over warn for normal student conversation

Respond with ONLY valid JSON — no markdown fences, no explanation, nothing else:
{
  "risk": "safe" | "warn",
  "category": "payment" | "off_platform" | "urgency" | "price_change" | null,
  "reason": "one short user-facing sentence, or null if safe"
}
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// RESULT VALIDATOR
// Ensures the shape is always correct even if the model hallucinates.
// Coerces any unexpected risk value (including old 'block') to 'safe'.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set(['payment', 'off_platform', 'urgency', 'price_change', null]);

const validateResult = (parsed) => {
  // Only allow warn or safe — treat block or anything unknown as safe
  let risk = parsed?.risk;
  if (risk === 'block') risk = 'warn';       // coerce old block → warn
  if (risk !== 'warn')  risk = 'safe';       // anything else → safe

  const category = VALID_CATEGORIES.has(parsed?.category) ? parsed.category : null;
  const reason   = (risk === 'warn' && typeof parsed?.reason === 'string')
    ? parsed.reason.slice(0, 200)
    : null;

  return { risk, category, reason };
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE FALLBACK
// Returned on any error so a Groq outage never breaks chat.
// ─────────────────────────────────────────────────────────────────────────────

const SAFE_FALLBACK = Object.freeze({ risk: 'safe', category: null, reason: null });

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
//
// analyzeMessage(rawText) → Promise<{ risk, category, reason }>
//
// Risk is always 'safe' or 'warn' — messages are NEVER blocked.
// The buyer is shown a warning banner; the message is always delivered.
//
// Privacy guarantees:
//   ✅ PII stripped BEFORE text leaves this function
//   ✅ Stripped text used for one Groq request only — never stored
//   ✅ Only the structured { risk, category, reason } object is returned
//   ✅ Raw text and stripped text are never logged
// ─────────────────────────────────────────────────────────────────────────────

export const analyzeMessage = async (rawText) => {
  // Skip trivially short messages — nothing to detect
  if (!rawText || rawText.trim().length < 4) return SAFE_FALLBACK;

  // Strip PII — Groq only ever sees placeholders, never real user data
  const sanitizedText = stripPII(rawText.trim());

  try {
    const response = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  120,
      temperature: 0,   // deterministic — same input → same output always
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: sanitizedText },
      ],
    });

    const raw    = response.choices[0]?.message?.content ?? '';
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return validateResult(parsed);

  } catch (err) {
    // JSON parse failure or Groq network error — fail open, never break chat
    console.error('[scamDetector] analysis error:', err.message);
    return SAFE_FALLBACK;
  }
};