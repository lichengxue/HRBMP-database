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

## Email Choices

The Edge Function can send email two ways:

1. **Google Apps Script / Gmail**: easiest temporary path. This sends from the
   Google account that owns the Apps Script deployment.
2. **Resend**: better production path, but requires a verified sender domain for
   arbitrary requesters.

For the current HRBMP demo, the Gmail path is usually simpler.

## Required Supabase Secrets For Gmail

Set these in Supabase Dashboard under **Edge Functions > Secrets**.

Do not commit these values to GitHub.

```text
HRBMP_EMAIL_PROVIDER=google_apps_script
HRBMP_GMAIL_WEBHOOK_URL=<saved only in Supabase Edge Function Secrets>
HRBMP_GMAIL_WEBHOOK_SECRET=<saved only in Supabase Edge Function Secrets>
HRBMP_ADMIN_EMAIL=chengxue.li@stonybrook.edu
HRBMP_SIGNED_URL_SECONDS=604800
```

`HRBMP_GMAIL_WEBHOOK_SECRET` must exactly match the Script Property in Google
Apps Script.

### Create The Gmail Apps Script Mailer

1. Open <https://script.google.com>.
2. Click **New project**.
3. Paste the code from:

```text
scripts/hrbmp_gmail_mailer_apps_script.gs
```

4. In Apps Script, open **Project Settings**.
5. Under **Script Properties**, add:

```text
HRBMP_GMAIL_WEBHOOK_SECRET=<same private value saved in Supabase>
```

6. Click **Deploy > New deployment**.
7. Choose **Web app**.
8. Use these settings:

```text
Execute as: Me
Who has access: Anyone
```

9. Click **Deploy**, authorize the script, and copy the Web app URL.
10. Put that URL into the Supabase secret `HRBMP_GMAIL_WEBHOOK_URL`.

Google Apps Script sends through the Google account that deployed the script.
Google's quotas are daily and depend on account type; Google lists MailApp email
recipients as 100 per day for consumer Gmail and 1,500 per day for Google
Workspace accounts at the time this workflow was written.

## Required Supabase Secrets For Resend

Set these in Supabase Dashboard under **Edge Functions > Secrets**.

Do not commit these values to GitHub.

```text
HRBMP_EMAIL_PROVIDER=resend
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
- The Gmail path does not need a Resend API key or verified Resend domain.
- Resend requires a valid API key and usually a verified sending domain before
  it can email arbitrary recipients.
- The GUI does not store email secrets. Email is sent only from the Edge
  Function.
