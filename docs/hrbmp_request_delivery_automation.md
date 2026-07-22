# HRBMP Request Delivery Automation

This workflow sends email download links when an HRBMP admin clicks
**Approve & Email** in the GUI request queue.

## What This Adds

The public Demo page inserts rows into `public.hrbmp_data_requests` with:

```text
request_status = submitted
```

The User Login admin panel then does this:

```text
Admin signs in with Supabase Auth
  -> Admin clicks Approve & Email
  -> GUI calls the deliver-approved-request Edge Function
  -> Edge Function verifies the signed-in admin email
  -> Edge Function creates signed download links and CSV manifests
  -> Edge Function emails the requester and copies the admin
  -> request_status becomes delivered
```

The first version sends signed file links and CSV manifests. It does not build a
zip package yet.

## Required Supabase Secrets

Set these in Supabase Dashboard under **Edge Functions > Secrets**.

Do not commit these values to GitHub.

```text
RESEND_API_KEY=paste-your-resend-api-key
HRBMP_EMAIL_FROM=HRBMP Archive <archive@your-verified-domain.edu>
HRBMP_ADMIN_EMAIL=chengxue.li@stonybrook.edu
HRBMP_SIGNED_URL_SECONDS=604800
```

`HRBMP_SIGNED_URL_SECONDS=604800` means the download links expire after seven
days.

The Edge Function also uses Supabase's built-in server-side project secrets:

```text
SUPABASE_URL
SUPABASE_SECRET_KEYS
```

Secret/service-role keys must never be placed in browser code.

## Deploy Through The Supabase Dashboard

This is the easiest path if the Supabase CLI is not installed.

1. Open the Supabase project dashboard.
2. Go to **Edge Functions**.
3. Click **Deploy a new function**.
4. Choose **Via Editor**.
5. Name the function:

```text
deliver-approved-request
```

6. Paste the code from:

```text
supabase/functions/deliver-approved-request/index.ts
```

7. Deploy the function.

The function URL will be:

```text
https://vnqulddrlhkftcqpekpl.supabase.co/functions/v1/deliver-approved-request
```

The function checks the signed-in Supabase Auth user and only allows the admin
email in `HRBMP_ADMIN_EMAIL`.

## Deploy Through The Supabase CLI

From the repository root:

```powershell
cd C:\Users\liche\Desktop\HRBMP-database
supabase login
supabase link --project-ref vnqulddrlhkftcqpekpl
supabase functions deploy deliver-approved-request --no-verify-jwt --project-ref vnqulddrlhkftcqpekpl
```

`--no-verify-jwt` is acceptable here because the function verifies the signed-in
admin user inside the function code before doing any work.

## Test

1. Submit a demo request from the HRBMP GUI.
2. Open **User Login** in the GUI.
3. Sign in as the Supabase Auth admin user.
4. Click **Approve & Email** for the submitted request.
5. Check the requester email.
6. If email does not arrive, check
   **Supabase > Edge Functions > deliver-approved-request > Logs**.

If the email succeeds, the row should change to:

```text
request_status = delivered
```

## Notes

- The signed links point to files in the private `fjs-archive` Storage bucket.
- The manifest CSV is written to
  `fjs-archive/request-packages/<request_id>/`.
- Resend requires a valid API key and usually a verified sending domain before
  it can email arbitrary recipients.
- The GUI does not store email secrets. Email is sent only from the Edge
  Function.
