# Security Specification — Shri Durga Developers & Promoters

## 1. Data Invariants
1. **Default Deny**: Every unmatched path under `/databases/{database}/documents` is denied for both read and write.
2. **PII Isolation**: `/enquiries/{enquiryId}` and `/subscribers/{subscriberId}` contain phone numbers and email addresses. Non-admin clients may NEVER `get`, `list`, `update`, or `delete` documents in either collection.
3. **Public Lead Intake Integrity**: Visitors may submit new documents to `/enquiries/{enquiryId}` only if `status == 'new'`, `adminNotes == ''`, all required fields pass strict type/length constraints, no ghost fields exist, and `createdAt == request.time && updatedAt == request.time`.
4. **Admin-Only Property Management**: `/properties/{propertyId}` is publicly readable (`get`, `list`) so visitors see live listings, while `create`, `update`, and `delete` require verified admin identity (`isAdmin()`), strict schema checks, `createdBy == request.auth.uid` on create, and immutable `createdBy`/`createdAt` on update.
5. **Verified Identity Guard**: Bootstrapped admin email checks MUST enforce `request.auth.token.email_verified == true` to defeat email spoofing.
6. **ID Poisoning & Size Bounds**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `isValidId()` (`^[a-zA-Z0-9_\-]+$`, `<= 128` chars), and every string and array enforces explicit `.size()` ceilings.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Enquiry Create**: Adding `isAdmin: true` to `/enquiries/enq_1` -> `PERMISSION_DENIED` (`hasOnly` check).
2. **Pre-Closed Status Forgery on Enquiry Create**: Submitting `status: "closed"` from public form -> `PERMISSION_DENIED` (`status == 'new'`).
3. **Forged Timestamp on Enquiry Create**: Supplying a client-backdated `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
4. **PII Snooping (Get Enquiry as Non-Admin)**: Authenticated regular user attempts `get` on `/enquiries/enq_1` -> `PERMISSION_DENIED`.
5. **PII Scraping (List Enquiries as Non-Admin)**: Authenticated regular user attempts `list` on `/enquiries` -> `PERMISSION_DENIED`.
6. **Unverified Email Admin Spoofing**: Token has `email: "uanusha017@gmail.com"` with `email_verified: false` -> `PERMISSION_DENIED`.
7. **Unauthorized Property Creation**: Non-admin attempts `create` on `/properties/prop_1` -> `PERMISSION_DENIED`.
8. **ID Poisoning on Property Create**: Document ID contains 200 chars or `/` / `$` symbols -> `PERMISSION_DENIED` (`isValidId`).
9. **Resource Exhaustion String Bomb**: `message` field with 5,000 characters on `/enquiries/enq_2` -> `PERMISSION_DENIED` (`<= 1500`).
10. **Immutable Field Tampering on Property Update**: Admin attempts to overwrite `createdBy` or `createdAt` -> `PERMISSION_DENIED`.
11. **Array Overflow on Property Create**: `specifications` array with 25 elements -> `PERMISSION_DENIED` (`<= 12`).
12. **Self-Escalation to Admin Registry**: Non-admin attempts to create `/admins/{theirUid}` with `role: "admin"` -> `PERMISSION_DENIED`.
