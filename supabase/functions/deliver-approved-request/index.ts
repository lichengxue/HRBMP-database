import { createClient } from "npm:@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type DataRequest = {
  request_id: string;
  request_status: string;
  requester_name?: string | null;
  requester_email: string;
  requester_affiliation?: string | null;
  intended_use?: string | null;
  request_notes?: string | null;
  selected_program?: string | null;
  selected_species?: string | null;
  selected_region?: string | null;
  selected_sample_id?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  requested_data_types?: string[] | null;
  matching_row_count?: number | null;
  public_row_count?: number | null;
  request_summary?: string | null;
  request_payload?: JsonRecord | null;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: DataRequest;
  old_record?: DataRequest | null;
};

type CatalogRow = {
  sample_id: string;
  program: string | null;
  sample_date: string | null;
  river_mile: number | null;
  river_region_number: number | null;
  river_region_name: string | null;
  taxon_code: number | null;
  common_name: string | null;
  scientific_name: string | null;
  young_of_year_count_corrected: number | null;
  yearling_count_corrected: number | null;
  older_count_corrected: number | null;
  yearling_and_older_count_corrected: number | null;
  total_count_corrected: number | null;
  asset_kind: string | null;
  storage_bucket: string | null;
  storage_object_path: string | null;
  original_file_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  effective_access_level: string | null;
};

type DeliveryContext = {
  approvedBy: string;
  source: "admin_gui" | "database_webhook";
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const WEBHOOK_SECRET_HEADER = "x-hrbmp-webhook-secret";
const DEFAULT_BUCKET = "fjs-archive";
const DEFAULT_ADMIN_EMAIL = "chengxue.li@stonybrook.edu";
const SIGNED_URL_SECONDS = Number(Deno.env.get("HRBMP_SIGNED_URL_SECONDS") ?? 60 * 60 * 24 * 7);

const CATALOG_SELECT = [
  "sample_id",
  "program",
  "sample_date",
  "river_mile",
  "river_region_number",
  "river_region_name",
  "taxon_code",
  "common_name",
  "scientific_name",
  "young_of_year_count_corrected",
  "yearling_count_corrected",
  "older_count_corrected",
  "yearling_and_older_count_corrected",
  "total_count_corrected",
  "asset_kind",
  "storage_bucket",
  "storage_object_path",
  "original_file_name",
  "mime_type",
  "file_size_bytes",
  "effective_access_level",
].join(",");

const ASSET_DATA_TYPES = new Set([
  "jar_label_image",
  "representative_species_image",
  "field_sheet_pdf",
  "lab_sheet_pdf",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": `authorization, x-client-info, apikey, content-type, ${WEBHOOK_SECRET_HEADER}`,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseAdmin = createAdminClient();
    const payload = await request.json().catch(() => ({})) as JsonRecord & WebhookPayload;
    const requestId = typeof payload.request_id === "string" ? payload.request_id : "";

    if (requestId) {
      const approvedBy = await requireAdminUser(request, supabaseAdmin);
      const dataRequest = await loadDataRequestById(supabaseAdmin, requestId);

      if (dataRequest.request_status === "delivered") {
        return jsonResponse({
          ok: true,
          request_id: dataRequest.request_id,
          status: "delivered",
          already_delivered: true,
        });
      }

      if (dataRequest.request_status === "declined") {
        return jsonResponse({ error: "Declined requests cannot be delivered." }, 409);
      }

      const result = await deliverRequest(supabaseAdmin, dataRequest, {
        approvedBy,
        source: "admin_gui",
      });
      return jsonResponse(result);
    }

    assertWebhookSecret(request);
    const dataRequest = payload.record;
    const oldRequest = payload.old_record;

    if (!shouldDeliverFromWebhook(payload, dataRequest, oldRequest)) {
      return jsonResponse({ ok: true, ignored: true });
    }

    if (!dataRequest?.request_id || !dataRequest.requester_email) {
      return jsonResponse({ error: "Webhook payload is missing request_id or requester_email" }, 400);
    }

    const result = await deliverRequest(supabaseAdmin, dataRequest, {
      approvedBy: "database-webhook",
      source: "database_webhook",
    });
    return jsonResponse(result);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, status);
  }
});

function createAdminClient() {
  return createClient(getSupabaseUrl(), getServiceKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireAdminUser(request: Request, supabaseAdmin: ReturnType<typeof createClient>) {
  const token = bearerToken(request);
  if (!token) throw new HttpError("Missing signed-in Supabase user token.", 401);

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) {
    throw new HttpError("Could not verify signed-in Supabase user.", 401);
  }

  const adminEmail = Deno.env.get("HRBMP_ADMIN_EMAIL") || DEFAULT_ADMIN_EMAIL;
  if (data.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new HttpError(`Signed-in user ${data.user.email} is not the HRBMP request admin.`, 403);
  }

  return data.user.email;
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function loadDataRequestById(supabaseAdmin: ReturnType<typeof createClient>, requestId: string) {
  const { data, error } = await supabaseAdmin
    .from("hrbmp_data_requests")
    .select("*")
    .eq("request_id", requestId)
    .single();

  if (error) throw new Error(`Could not load request ${requestId}: ${error.message}`);
  if (!data) throw new Error(`Request ${requestId} was not found.`);
  return data as DataRequest;
}

async function deliverRequest(
  supabaseAdmin: ReturnType<typeof createClient>,
  dataRequest: DataRequest,
  context: DeliveryContext,
) {
  await markPackaging(supabaseAdmin, dataRequest, context);

  try {
    const catalogRows = await loadCatalogRows(supabaseAdmin, dataRequest);
    const requestedTypes = new Set(dataRequest.requested_data_types ?? []);
    const wantsAllTypes = requestedTypes.size === 0 || requestedTypes.has("all_data");
    const wantsCounts = wantsAllTypes || requestedTypes.has("processed_abundance_count");
    const wantsAssets = (kind: string | null) =>
      Boolean(kind && ASSET_DATA_TYPES.has(kind) && (wantsAllTypes || requestedTypes.has(kind)));

    const countRows = wantsCounts ? uniqueCountRows(catalogRows) : [];
    const assetRows = uniqueAssetRows(catalogRows.filter((row) => wantsAssets(row.asset_kind)));
    const assetLinks = await createAssetSignedLinks(supabaseAdmin, assetRows);
    const expiresAt = new Date(Date.now() + SIGNED_URL_SECONDS * 1000).toISOString();

    const requestFolder = `request-packages/${dataRequest.request_id}`;
    const countsLink = countRows.length
      ? await uploadCsvAndSign(
        supabaseAdmin,
        requestFolder,
        `hrbmp_request_${dataRequest.request_id}_processed_counts.csv`,
        countRowsToCsv(countRows),
      )
      : null;

    const manifestLink = await uploadCsvAndSign(
      supabaseAdmin,
      requestFolder,
      `hrbmp_request_${dataRequest.request_id}_manifest.csv`,
      manifestToCsv(assetLinks, countRows, countsLink?.path ?? "", countsLink?.url ?? ""),
    );

    await sendDeliveryEmail(dataRequest, {
      assetLinks,
      countRowCount: countRows.length,
      countsUrl: countsLink?.url ?? null,
      manifestUrl: manifestLink.url,
      expiresAt,
    });

    await markDelivered(supabaseAdmin, dataRequest, {
      approved_by: context.approvedBy,
      delivery_source: context.source,
      delivered_at: new Date().toISOString(),
      signed_url_expires_at: expiresAt,
      manifest_path: manifestLink.path,
      counts_path: countsLink?.path ?? null,
      asset_link_count: assetLinks.length,
      count_row_count: countRows.length,
    });

    return {
      ok: true,
      request_id: dataRequest.request_id,
      status: "delivered",
      asset_link_count: assetLinks.length,
      count_row_count: countRows.length,
      requester_email: dataRequest.requester_email,
    };
  } catch (error) {
    await markDeliveryFailed(supabaseAdmin, dataRequest, {
      approved_by: context.approvedBy,
      delivery_source: context.source,
      failed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function assertWebhookSecret(request: Request) {
  const expectedSecret = Deno.env.get("HRBMP_REQUEST_WEBHOOK_SECRET");
  const receivedSecret = request.headers.get(WEBHOOK_SECRET_HEADER);

  if (!expectedSecret) {
    throw new Error("Missing HRBMP_REQUEST_WEBHOOK_SECRET Edge Function secret");
  }

  if (!receivedSecret || receivedSecret !== expectedSecret) {
    throw new HttpError("Unauthorized webhook request", 401);
  }
}

function shouldDeliverFromWebhook(payload: WebhookPayload, record?: DataRequest, oldRecord?: DataRequest | null) {
  return payload.type === "UPDATE" &&
    payload.schema === "public" &&
    payload.table === "hrbmp_data_requests" &&
    record?.request_status === "approved" &&
    oldRecord?.request_status !== "approved";
}

function getSupabaseUrl() {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("Missing SUPABASE_URL Edge Function secret");
  return url;
}

function getServiceKey() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      const key = parsed.default ?? Object.values(parsed)[0];
      if (key) return key;
    } catch {
      // Fall through to the legacy key below.
    }
  }

  const legacyServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyServiceRole) return legacyServiceRole;

  throw new Error("Missing Supabase secret/service-role key in Edge Function environment");
}

async function loadCatalogRows(supabaseAdmin: ReturnType<typeof createClient>, dataRequest: DataRequest) {
  let query = supabaseAdmin
    .from("fjs_archive_catalog")
    .select(CATALOG_SELECT)
    .eq("effective_access_level", "public")
    .limit(5000);

  if (hasValue(dataRequest.selected_program)) {
    query = query.eq("program", dataRequest.selected_program);
  }
  if (hasValue(dataRequest.selected_species)) {
    query = query.eq("common_name", dataRequest.selected_species);
  }
  if (hasValue(dataRequest.selected_sample_id)) {
    query = query.eq("sample_id", dataRequest.selected_sample_id);
  }
  if (Number.isInteger(dataRequest.year_start)) {
    query = query.gte("sample_date", `${dataRequest.year_start}-01-01`);
  }
  if (Number.isInteger(dataRequest.year_end)) {
    query = query.lte("sample_date", `${dataRequest.year_end}-12-31`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Could not load FJS archive rows: ${error.message}`);

  return ((data ?? []) as CatalogRow[]).filter((row) => regionMatches(row, dataRequest.selected_region));
}

function hasValue(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized.length > 0 && normalized !== "all";
}

function regionMatches(row: CatalogRow, selectedRegion?: string | null) {
  if (!hasValue(selectedRegion)) return true;
  const requested = String(selectedRegion).trim().toLowerCase();
  const requestedCode = requested.split("-")[0].trim();
  const rowRegion = String(row.river_region_name ?? "").trim().toLowerCase();
  return rowRegion === requested || rowRegion === requestedCode;
}

function uniqueCountRows(rows: CatalogRow[]) {
  const bySampleTaxon = new Map<string, CatalogRow>();
  rows.forEach((row) => {
    const key = `${row.sample_id}|${row.taxon_code ?? ""}|${row.common_name ?? ""}`;
    if (!bySampleTaxon.has(key)) bySampleTaxon.set(key, row);
  });
  return Array.from(bySampleTaxon.values()).sort(compareCatalogRows);
}

function uniqueAssetRows(rows: CatalogRow[]) {
  const byStoragePath = new Map<string, CatalogRow>();
  rows.forEach((row) => {
    if (!row.storage_object_path) return;
    const bucket = row.storage_bucket || DEFAULT_BUCKET;
    const key = `${bucket}/${row.storage_object_path}`;
    if (!byStoragePath.has(key)) byStoragePath.set(key, row);
  });
  return Array.from(byStoragePath.values()).sort(compareCatalogRows);
}

async function createAssetSignedLinks(supabaseAdmin: ReturnType<typeof createClient>, rows: CatalogRow[]) {
  const links = [];

  for (const row of rows) {
    const bucket = row.storage_bucket || DEFAULT_BUCKET;
    const path = row.storage_object_path;
    if (!path) continue;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_SECONDS, { download: true });

    if (error) throw new Error(`Could not sign ${bucket}/${path}: ${error.message}`);

    links.push({
      ...row,
      storage_bucket: bucket,
      storage_object_path: path,
      download_url: data.signedUrl,
    });
  }

  return links;
}

async function uploadCsvAndSign(
  supabaseAdmin: ReturnType<typeof createClient>,
  folder: string,
  fileName: string,
  csv: string,
) {
  const path = `${folder}/${fileName}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(DEFAULT_BUCKET)
    .upload(path, new Blob([csv], { type: "text/csv" }), {
      contentType: "text/csv",
      upsert: true,
    });

  if (uploadError) throw new Error(`Could not upload ${path}: ${uploadError.message}`);

  const { data, error } = await supabaseAdmin.storage
    .from(DEFAULT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS, { download: true });

  if (error) throw new Error(`Could not sign ${path}: ${error.message}`);

  return { path, url: data.signedUrl };
}

async function sendDeliveryEmail(
  dataRequest: DataRequest,
  delivery: {
    assetLinks: Array<CatalogRow & { download_url: string }>;
    countRowCount: number;
    countsUrl: string | null;
    manifestUrl: string;
    expiresAt: string;
  },
) {
  const subject = `HRBMP data request ready: ${dataRequest.request_id}`;
  const html = buildEmailHtml(dataRequest, delivery);
  const text = buildEmailText(dataRequest, delivery);
  const provider = (Deno.env.get("HRBMP_EMAIL_PROVIDER") || "").trim().toLowerCase();
  const googleWebhookUrl = Deno.env.get("HRBMP_GMAIL_WEBHOOK_URL");

  if (provider === "google_apps_script" || googleWebhookUrl) {
    await sendWithGoogleAppsScript(dataRequest, { subject, html, text });
    return;
  }

  await sendWithResend(dataRequest, { subject, html, text });
}

async function sendWithResend(
  dataRequest: DataRequest,
  messageContent: {
    subject: string;
    html: string;
    text: string;
  },
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("HRBMP_EMAIL_FROM");
  const adminEmail = Deno.env.get("HRBMP_ADMIN_EMAIL") || DEFAULT_ADMIN_EMAIL;

  if (!resendApiKey) throw new Error("Missing RESEND_API_KEY Edge Function secret");
  if (!fromEmail) throw new Error("Missing HRBMP_EMAIL_FROM Edge Function secret");

  const message: JsonRecord = {
    from: fromEmail,
    to: [dataRequest.requester_email],
    subject: messageContent.subject,
    html: messageContent.html,
    text: messageContent.text,
  };

  if (adminEmail.toLowerCase() !== dataRequest.requester_email.toLowerCase()) {
    message.cc = [adminEmail];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${detail}`);
  }
}

async function sendWithGoogleAppsScript(
  dataRequest: DataRequest,
  messageContent: {
    subject: string;
    html: string;
    text: string;
  },
) {
  const webhookUrl = Deno.env.get("HRBMP_GMAIL_WEBHOOK_URL");
  const webhookSecret = Deno.env.get("HRBMP_GMAIL_WEBHOOK_SECRET");
  const adminEmail = Deno.env.get("HRBMP_ADMIN_EMAIL") || DEFAULT_ADMIN_EMAIL;

  if (!webhookUrl) throw new Error("Missing HRBMP_GMAIL_WEBHOOK_URL Edge Function secret");
  if (!webhookSecret) throw new Error("Missing HRBMP_GMAIL_WEBHOOK_SECRET Edge Function secret");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: webhookSecret,
      to: dataRequest.requester_email,
      cc: adminEmail.toLowerCase() === dataRequest.requester_email.toLowerCase() ? "" : adminEmail,
      replyTo: adminEmail,
      subject: messageContent.subject,
      text: messageContent.text,
      html: messageContent.html,
    }),
  });

  const detail = await response.text();
  if (!response.ok) {
    throw new Error(`Google Apps Script email failed: ${response.status} ${detail}`);
  }

  try {
    const parsed = JSON.parse(detail) as { ok?: boolean; error?: string };
    if (!parsed.ok) {
      throw new Error(parsed.error || detail || "Google Apps Script email failed");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Google Apps Script email returned invalid JSON: ${detail}`);
    }
    throw error;
  }
}

function buildEmailHtml(
  dataRequest: DataRequest,
  delivery: {
    assetLinks: Array<CatalogRow & { download_url: string }>;
    countRowCount: number;
    countsUrl: string | null;
    manifestUrl: string;
    expiresAt: string;
  },
) {
  const name = escapeHtml(dataRequest.requester_name || "HRBMP data requester");
  const assetLines = delivery.assetLinks.slice(0, 25).map((link) =>
    `<li><a href="${escapeHtml(link.download_url)}">${escapeHtml(link.original_file_name || link.storage_object_path)}</a> (${escapeHtml(formatLabel(link.asset_kind || "asset"))})</li>`
  ).join("");
  const moreLine = delivery.assetLinks.length > 25
    ? `<li>${delivery.assetLinks.length - 25} more file links are listed in the manifest CSV.</li>`
    : "";

  return `
    <p>Hello ${name},</p>
    <p>Your HRBMP data request has been approved and prepared.</p>
    <p><strong>Request ID:</strong> ${escapeHtml(dataRequest.request_id)}</p>
    <p><strong>Summary:</strong> ${escapeHtml(dataRequest.request_summary || "HRBMP archive request")}</p>
    <p><a href="${escapeHtml(delivery.manifestUrl)}">Download the request manifest CSV</a></p>
    ${delivery.countsUrl ? `<p><a href="${escapeHtml(delivery.countsUrl)}">Download processed count data CSV</a></p>` : ""}
    <p><strong>Archive file links:</strong></p>
    <ul>${assetLines || "<li>No image/PDF assets matched this request.</li>"}${moreLine}</ul>
    <p>These links expire on ${escapeHtml(delivery.expiresAt)}.</p>
    <p>HRBMP Data Management</p>
  `;
}

function buildEmailText(
  dataRequest: DataRequest,
  delivery: {
    assetLinks: Array<CatalogRow & { download_url: string }>;
    countRowCount: number;
    countsUrl: string | null;
    manifestUrl: string;
    expiresAt: string;
  },
) {
  const lines = [
    `Hello ${dataRequest.requester_name || "HRBMP data requester"},`,
    "",
    "Your HRBMP data request has been approved and prepared.",
    `Request ID: ${dataRequest.request_id}`,
    `Summary: ${dataRequest.request_summary || "HRBMP archive request"}`,
    `Manifest CSV: ${delivery.manifestUrl}`,
  ];

  if (delivery.countsUrl) lines.push(`Processed count data CSV: ${delivery.countsUrl}`);
  lines.push("", "Archive file links:");
  if (delivery.assetLinks.length === 0) {
    lines.push("No image/PDF assets matched this request.");
  } else {
    delivery.assetLinks.forEach((link) => {
      lines.push(`${link.original_file_name || link.storage_object_path}: ${link.download_url}`);
    });
  }
  lines.push("", `These links expire on ${delivery.expiresAt}.`, "", "HRBMP Data Management");
  return lines.join("\n");
}

async function markPackaging(
  supabaseAdmin: ReturnType<typeof createClient>,
  dataRequest: DataRequest,
  context: DeliveryContext,
) {
  const requestPayload = {
    ...plainObject(dataRequest.request_payload),
    delivery_attempt: {
      approved_by: context.approvedBy,
      delivery_source: context.source,
      started_at: new Date().toISOString(),
    },
  };

  const { error } = await supabaseAdmin
    .from("hrbmp_data_requests")
    .update({
      request_status: "packaging",
      request_payload: requestPayload,
    })
    .eq("request_id", dataRequest.request_id);

  if (error) throw new Error(`Could not mark request packaging: ${error.message}`);
  dataRequest.request_payload = requestPayload;
}

async function markDelivered(
  supabaseAdmin: ReturnType<typeof createClient>,
  dataRequest: DataRequest,
  delivery: JsonRecord,
) {
  const requestPayload = {
    ...plainObject(dataRequest.request_payload),
    delivery,
  };

  const { error } = await supabaseAdmin
    .from("hrbmp_data_requests")
    .update({
      request_status: "delivered",
      request_payload: requestPayload,
    })
    .eq("request_id", dataRequest.request_id);

  if (error) throw new Error(`Could not mark request delivered: ${error.message}`);
}

async function markDeliveryFailed(
  supabaseAdmin: ReturnType<typeof createClient>,
  dataRequest: DataRequest,
  deliveryError: JsonRecord,
) {
  const requestPayload = {
    ...plainObject(dataRequest.request_payload),
    delivery_error: deliveryError,
  };

  const { error } = await supabaseAdmin
    .from("hrbmp_data_requests")
    .update({
      request_status: "approved",
      request_payload: requestPayload,
    })
    .eq("request_id", dataRequest.request_id);

  if (error) console.error("Could not mark delivery failed:", error.message);
}

function manifestToCsv(
  assetLinks: Array<CatalogRow & { download_url: string }>,
  countRows: CatalogRow[],
  countsPath: string,
  countsUrl: string,
) {
  const rows = [
    ...countRows.map((row) => ({
      row_type: "processed_abundance_count",
      sample_id: row.sample_id,
      sample_date: row.sample_date,
      common_name: row.common_name,
      scientific_name: row.scientific_name,
      river_region_name: row.river_region_name,
      data_type: "processed_abundance_count",
      original_file_name: "processed_counts_by_sample_taxon.csv",
      storage_bucket: DEFAULT_BUCKET,
      storage_object_path: countsPath,
      download_url: countsUrl,
      total_count_corrected: row.total_count_corrected,
    })),
    ...assetLinks.map((row) => ({
      row_type: "archive_asset",
      sample_id: row.sample_id,
      sample_date: row.sample_date,
      common_name: row.common_name,
      scientific_name: row.scientific_name,
      river_region_name: row.river_region_name,
      data_type: row.asset_kind,
      original_file_name: row.original_file_name,
      storage_bucket: row.storage_bucket,
      storage_object_path: row.storage_object_path,
      download_url: row.download_url,
      total_count_corrected: row.total_count_corrected,
    })),
  ];

  return objectsToCsv(rows, [
    "row_type",
    "sample_id",
    "sample_date",
    "common_name",
    "scientific_name",
    "river_region_name",
    "data_type",
    "original_file_name",
    "storage_bucket",
    "storage_object_path",
    "download_url",
    "total_count_corrected",
  ]);
}

function countRowsToCsv(rows: CatalogRow[]) {
  return objectsToCsv(rows.map((row) => ({
    sample_id: row.sample_id,
    program: row.program,
    sample_date: row.sample_date,
    river_mile: row.river_mile,
    river_region_number: row.river_region_number,
    river_region_name: row.river_region_name,
    taxon_code: row.taxon_code,
    common_name: row.common_name,
    scientific_name: row.scientific_name,
    young_of_year_count_corrected: row.young_of_year_count_corrected,
    yearling_count_corrected: row.yearling_count_corrected,
    older_count_corrected: row.older_count_corrected,
    yearling_and_older_count_corrected: row.yearling_and_older_count_corrected,
    total_count_corrected: row.total_count_corrected,
  })), [
    "sample_id",
    "program",
    "sample_date",
    "river_mile",
    "river_region_number",
    "river_region_name",
    "taxon_code",
    "common_name",
    "scientific_name",
    "young_of_year_count_corrected",
    "yearling_count_corrected",
    "older_count_corrected",
    "yearling_and_older_count_corrected",
    "total_count_corrected",
  ]);
}

function plainObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function objectsToCsv(rows: Array<Record<string, unknown>>, columns: string[]) {
  const body = rows.map((row) => columns.map((column) => csvCell(row[column])).join(","));
  return [columns.join(","), ...body].join("\n");
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function compareCatalogRows(a: CatalogRow, b: CatalogRow) {
  return String(a.sample_id).localeCompare(String(b.sample_id)) ||
    String(a.common_name ?? "").localeCompare(String(b.common_name ?? "")) ||
    String(a.asset_kind ?? "").localeCompare(String(b.asset_kind ?? "")) ||
    String(a.original_file_name ?? "").localeCompare(String(b.original_file_name ?? ""));
}

function formatLabel(value: string) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
