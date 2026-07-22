const HRBMP_WEBHOOK_SECRET_PROPERTY = "HRBMP_GMAIL_WEBHOOK_SECRET";

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const expectedSecret = PropertiesService
      .getScriptProperties()
      .getProperty(HRBMP_WEBHOOK_SECRET_PROPERTY);

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    if (!payload.to || !payload.subject || !payload.text) {
      return jsonResponse({ ok: false, error: "Missing to, subject, or text" });
    }

    MailApp.sendEmail(payload.to, payload.subject, payload.text, {
      name: "HRBMP Archive",
      htmlBody: payload.html || undefined,
      cc: payload.cc || undefined,
      replyTo: payload.replyTo || undefined,
    });

    return jsonResponse({
      ok: true,
      remainingDailyQuota: MailApp.getRemainingDailyQuota(),
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
