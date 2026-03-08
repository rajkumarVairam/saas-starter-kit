# Storage & Email — R2 File Upload, React Email, Deliverability

## 6. File Upload (Cloudflare R2)

**Recommended:** Cloudflare R2 — free 10 GB/month, S3-compatible API
**Alternative:** Uploadthing (`pnpm add uploadthing @uploadthing/react`) — simpler, less control

**Install:** `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

### Environment variables

```
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""   # https://pub-xxx.r2.dev or custom domain
```

### lib/r2.ts

```typescript
import { S3Client } from "@aws-sdk/client-s3"
export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
})
```

### Signed URL pattern — never proxy files through Next.js

```typescript
// app/api/upload/presign/route.ts
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const { filename, contentType, size } = await req.json()

    const MAX_BYTES = 10 * 1024 * 1024
    const ALLOWED   = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (size > MAX_BYTES)               return new Response("File too large", { status: 413 })
    if (!ALLOWED.includes(contentType)) return new Response("Type not allowed", { status: 415 })

    const key = `${session.user.id}/${crypto.randomUUID()}-${filename}`
    const url = await getSignedUrl(r2, new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!, Key: key,
        ContentType: contentType, ContentLength: size,
    }), { expiresIn: 120 })

    return Response.json({ url, key, publicUrl: `${process.env.R2_PUBLIC_URL}/${key}` })
}
```

### Client upload flow

```typescript
// 1. Get signed URL
const { url, publicUrl } = await fetch("/api/upload/presign", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
}).then(r => r.json())

// 2. PUT directly to R2 — never proxy through Next.js
await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })

// 3. Save publicUrl to DB
```

### Drizzle schema — file table

```typescript
export const file = pgTable("file", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    url: text("url").notNull(),
    name: text("name").notNull(),
    size: integer("size").notNull(),
    mimeType: text("mime_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

---

## 7. Email Templates (React Email)

**Install:** `pnpm add react-email @react-email/components`
**Dev preview:** `pnpm email dev`

### File structure

```
emails/
  welcome.tsx
  reset-password.tsx
  verify-email.tsx
  magic-link.tsx
  invite-member.tsx
```

### Template pattern

```typescript
// emails/reset-password.tsx
import { Html, Head, Body, Container, Text, Button, Hr } from "@react-email/components"

export default function ResetPasswordEmail({ url, name }: { url: string; name: string }) {
    return (
        <Html><Head />
        <Body style={{ fontFamily: "sans-serif", background: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
            <Text>Hi {name},</Text>
            <Text>Click below to reset your password. This link expires in 1 hour.</Text>
            <Button href={url} style={{ background: "#7c3aed", color: "#fff", padding: "12px 24px", borderRadius: 6 }}>
                Reset Password
            </Button>
            <Hr />
            <Text style={{ color: "#6b7280", fontSize: 12 }}>If you didn't request this, ignore this email.</Text>
        </Container>
        </Body></Html>
    )
}
```

### Sending with Resend

```typescript
import { render } from "@react-email/render"
import ResetPasswordEmail from "@/emails/reset-password"

const html = await render(<ResetPasswordEmail url={url} name={user.name} />)
resend.emails.send({ from, to: user.email, subject: "Reset your password", html })
    .catch(console.error)  // always fire-and-forget
```

---

## 29. Email Deliverability

Without these DNS records, emails land in spam — even with Resend.

### DNS records to add (in your domain registrar)

```
# SPF — authorize Resend to send on behalf of your domain
TXT  @   "v=spf1 include:_spf.resend.com ~all"

# DKIM — Resend provides this in their dashboard
CNAME  resend._domainkey   resend._domainkey.resend.com.

# DMARC — start with p=none to monitor, then move to p=quarantine
TXT  _dmarc   "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### Verify with Resend

1. Add domain in Resend dashboard → Domains → Add Domain
2. Add the CNAME/TXT records they provide
3. Wait for green checkmarks (can take up to 48h)
4. Change `EMAIL_FROM` to `noreply@yourdomain.com`

### Email best practices

- Always set `Reply-To` to a monitored inbox (not the sending address)
- Include a physical mailing address in marketing emails (CAN-SPAM)
- Unsubscribe link required in marketing emails — not required for transactional
