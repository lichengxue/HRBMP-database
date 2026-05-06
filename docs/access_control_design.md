# Access Control Design

This prototype uses role-based access control plus dataset release policy. The
GUI displays access rules, but the API/server must enforce the rules before any
restricted record is returned.

## Access Tiers

| Tier | Login | Intended Access |
|---|---:|---|
| Public | No | Published metadata, maps, summaries, and public CSV exports |
| Registered External User | Yes | Approved public-use datasets and higher-resolution non-sensitive downloads |
| Approved Research User | Yes, manual approval | Restricted datasets after project review or data-use agreement |
| Data Manager | Yes | QA/QC, metadata editing, data request review, and release preparation |
| Admin | Yes, strongest protection | User management, full database operations, and system settings |

## SQLite Tables

- `access_levels`: public-to-admin tier definitions.
- `roles`: application roles assigned to users.
- `role_access_levels`: which access levels each role can reach.
- `users`: account records. Store password hashes only, never real passwords.
- `user_roles`: role assignments and optional expiration dates.
- `dataset_access_policy`: minimum access level, release status, sensitivity, and embargo notes for each dataset.
- `dataset_role_permissions`: per-dataset permissions for each role.
- `access_requests`: external or collaborator requests before approval.
- `data_use_agreements`: agreement status and expiration tracking.
- `download_audit_log`: restricted download and access-decision logging.

## Account Workflow

1. Public users browse without login.
2. External users submit an access request.
3. A data manager reviews the request and any data-use agreement.
4. The system creates an invited account after approval.
5. The user sets their own password through a one-time setup link.
6. The API checks user role, dataset policy, release status, and embargo before returning data.
7. Restricted downloads are written to `download_audit_log`.

Do not email plain-text passwords. Do not store real passwords in Git or SQLite
seed files.

## Git And GitHub Rules

Commit:

- SQL schema and seed policy definitions
- API source code
- GUI code
- Documentation
- Fake example records only

Do not commit:

- Real restricted data
- `database/*.sqlite`
- Real user records
- Password hashes from production
- API keys, tokens, or secret configuration

## Future Enforcement

The current GUI is a planning interface. Production enforcement should happen
inside the hosted API:

- Default deny.
- Explicit dataset permission checks.
- HTTPS only.
- Secure session cookies.
- Password hashing with a standard algorithm.
- MFA for data managers and admins if feasible.
- Audit logging for restricted access.
