# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched (`/test/**`, arbitrary subcollections, etc.) are denied for both reads and writes.
2. **Owner-Isolated Private Profiles (`/users/{uid}`)**: Only the authenticated verified owner (`request.auth.uid == uid`) may read (`get`), create, update, or delete their `/users/{uid}` document. `allow list` is strictly `false`.
3. **Owner-Controlled Editions (`/editions/{uid}`)**:
   - Only an authenticated, email-verified user whose `request.auth.uid == uid` may create, update, or delete `/editions/{uid}`.
   - `uid` and `createdAt` are immutable after creation.
   - `createdAt` and `updatedAt` must strictly equal `request.time`.
   - `list` queries are enforced on `resource.data`: non-owners can list ONLY documents where `resource.data.isPublic == true`. Private editions (`isPublic == false`) are strictly inaccessible to non-owners for both `get` and `list`.
   - Zero PII (`email`, `phone`, `address`) exists in `/editions/{uid}`.
4. **Volumetric & Schema Strictness**: Every write checks `hasAll` + `hasOnly` (no shadow/ghost fields), `isValidId(uid)`, string `.size()` bounds matching `firebase-blueprint.json`, and list/map `.size()` bounds.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. Unauthenticated write to `/editions/userA`
2. Unverified email write (`email_verified: false`) to `/editions/userA`
3. Identity spoofing create: signed in as `userB` creating `/editions/userA` or setting `data.uid = "userA"` inside `/editions/userB`
4. Shadow/ghost field injection: creating `/editions/userA` with an extra key `isAdmin: true` or `isVerified: true`
5. Oversized `displayName` (> 80 chars) or empty `displayName` (`""`)
6. Oversized `bio` (> 200 chars)
7. Type poisoning: `isPublic: "true"` (string instead of bool) or `addedQuestions: ["string"]` (non-map array element)
8. Poisoned document ID: `/editions/bad$id..with..chars` failing `isValidId()`
9. Client timestamp spoofing: `updatedAt` set to past/future client timestamp instead of `request.time`
10. Immutable field mutation: updating `uid` or `createdAt` on an existing `/editions/userA`
11. Unbounded revision downgrade or negative revision (`revision: -1`)
12. Unauthorized read/list of private edition (`isPublic: false`) or `/users/{otherUid}` by another user (`userB`)
