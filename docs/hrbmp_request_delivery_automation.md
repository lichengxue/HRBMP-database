# HRBMP Request Delivery Automation

This workflow sends email download links after an administrator approves an
HRBMP data request in Supabase.

## What This Adds

The public GUI already inserts rows into `public.hrbmp_data_requests` with
`request_status = 'submitted'`.

This automation adds the next step:

```text
Admin changes request_status to approved
  -> Supabase Database Webhook fires
  -> Edge Function validates the webhook secret
  -> Edge Function creates signed download links
  -> Edge Function emails the requester and copies the admin
  -> request_status becomes delivered
```

The first version sends signed file links and CSV manifests. It does not build a
zip package yet.

## Required Supabase Secrets

Set these in Supabase Dashboard under **Edge Functions > Secrets**.

Do not commit these values to GitHub.

```text
HRBMP_REQUEST_WEBHOOK_SECRET=make-a-long-random-private-secret
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

Those are available to deployed Supabase Edge Functions. Secret/service-role
keys must never be placed in browser code.

## Deploy The Edge Function

From the repository root:

```powershell
cd C:\Users\liche\Desktop\HRBMP-database
supabase login
supabase link --project-ref vnqulddrlhkftcqpekpl
supabase functions deploy deliver-approved-request --no-verify-jwt --project-ref vnqulddrlhkftcqpekpl
```

The function URL will be:

```text
https://vnqulddrlhkftcqpekpl.supabase.co/functions/v1/deliver-approved-request
```

`--no-verify-jwt` is intentional here because the caller is a database webhook,
not a browser user. The function still checks the private
`x-hrbmp-webhook-secret` header before doing any work.

## Create The Database Webhook

In Supabase Dashboard:

1. Open **Database**.
2. Open **Webhooks**.
3. Click **Create a new hook**.
4. Name it `deliver_approved_hrbmp_data_request`.
5. Select schema `public`.
6. Select table `hrbmp_data_requests`.
7. Select event `UPDATE`.
8. Choose HTTP method `POST`.
9. Use this URL:

```text
https://vnqulddrlhkftcqpekpl.supabase.co/functions/v1/deliver-approved-request
```

Add these headers:

```text
Content-Type: application/json
x-hrbmp-webhook-secret: the-same-value-as-HRBMP_REQUEST_WEBHOOK_SECRET
```

Save the webhook.

The webhook can fire on every update to `hrbmp_data_requests`; the Edge Function
ignores updates unless the status just changed to `approved`.

## Test

1. Submit a demo request from the HRBMP GUI.
2. In Supabase Table Editor, open `hrbmp_data_requests`.
3. Change the newest row's `request_status` from `submitted` to `approved`.
4. Wait a few seconds.
5. Check the requester's email.
6. Check Supabase **Edge Functions > deliver-approved-request > Logs** if the
   email does not arrive.

If the email succeeds, the row should change from `approved` to `delivered`.

## Notes

- The signed links point to files in the private `fjs-archive` Storage bucket.
- The manifest CSV is written to
  `fjs-archive/request-packages/<request_id>/`.
- Resend requires a valid API key and usually a verified sending domain before
  it can email arbitrary recipients.
- The database itself does not send email. The webhook only tells the Edge
  Function that an approved request is ready to deliver.
