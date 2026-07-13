# Pathfinder Wall Street Doctrine v0.1 Security Specification

## 1. Data Invariants

-   **Portfolio Ownership & Mutability**: A portfolio configuration document cannot exist or be modified unless its ID is bound to a validated, authenticated user (`request.auth.uid`). Users can only read and write their own portfolio.
-   **Delta Journal Validation**: Every entry in the append-only delta journal must be stamped with a server-validated `createdAt` timestamp matching `request.time`. Field types must strictly conform (e.g., `confidenceScore` is a valid number, `newsTitle` length does not exceed 300 characters, and `jemmaPassed` is a boolean).
-   **Checklist Structural Integrity**: A workspace card checklist can only hold items corresponding to one of the six sovereign sector IDs (`compute`, `infra`, `quantum`, `materials`, `energy`, `government`). All mutations must verify the user's signature.
-   **Chat Message Isolation**: Chat logs with advisory agent Alice are isolated to the authenticated user. Custom claims are not supported; authentication must be active with standard verified email parameters.

---

## 2. The "Dirty Dozen" Payloads

We define 12 malicious payloads designed to stress-test and compromise the access control structure:

| Payload ID | Target Collection | Attack Vector | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **D1** | `/portfolios/{pId}` | Spoof someone else's `userId` on creation | `PERMISSION_DENIED` |
| **D2** | `/portfolios/{pId}` | Overwrite existing `userId` to steal portfolio | `PERMISSION_DENIED` |
| **D3** | `/portfolios/{pId}` | Inject massive 5MB random string as ticker symbols map | `PERMISSION_DENIED` |
| **D4** | `/delta_journals/{jId}` | Bypass schema validation with unlisted fields | `PERMISSION_DENIED` |
| **D5** | `/delta_journals/{jId}` | Self-approve Jemma check (`jemmaPassed: true` without all array items) | `PERMISSION_DENIED` |
| **D6** | `/delta_journals/{jId}` | Post static/historic client-side timestamp as `createdAt` | `PERMISSION_DENIED` |
| **D7** | `/chat_messages/{mId}` | Write message from "alice" (sender impersonation) | `PERMISSION_DENIED` |
| **D8** | `/chat_messages/{mId}` | Inject giant 10MB text block into message body | `PERMISSION_DENIED` |
| **D9** | `/chat_messages/{mId}` | Read someone else's message history without authorization | `PERMISSION_DENIED` |
| **D10** | `/card_checklists/{cId}` | Inject non-allowed category ID like `crypto_moon` | `PERMISSION_DENIED` |
| **D11** | `/card_checklists/{cId}` | Overwrite checklist item array with deep nested maps | `PERMISSION_DENIED` |
| **D12** | `/portfolios/{pId}` | Delete portfolio of another user | `PERMISSION_DENIED` |

---

## 3. The Test Runner

The standard Firestore local emulator uses `firestore.rules.test.ts` or local unit scripts to mock operations. All test sequences enforce that any of the "Dirty Dozen" payloads fail with `PERMISSION_DENIED` under all circumstances.
