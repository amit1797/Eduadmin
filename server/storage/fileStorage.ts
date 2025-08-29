import crypto from "crypto";

function sha256Hex(data: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmac(key: crypto.BinaryLike, data: crypto.BinaryLike) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function getSigningKey(secretKey: string, date: string, region: string, service: string) {
  const kDate = hmac("AWS4" + secretKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  return kSigning;
}

function formatAmzDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function shortDate(amzDate: string) {
  return amzDate.slice(0, 8);
}

function buildUrl(params: { bucket: string; region: string; endpoint?: string; forcePathStyle: boolean; key: string }): URL {
  const { bucket, region, endpoint, forcePathStyle, key } = params;
  if (!endpoint) {
    return new URL(`https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`);
  }
  const cleaned = endpoint.replace(/\/$/, "");
  if (forcePathStyle) {
    return new URL(`${cleaned}/${bucket}/${encodeURI(key)}`);
  }
  const url = new URL(cleaned);
  const host = url.host;
  url.host = `${bucket}.${host}`;
  url.pathname = `/${encodeURI(key)}`;
  return url;
}

export async function createPresignedPutUrl(params: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const { key, contentType, expiresInSeconds = 900 } = params;

  // Read configuration lazily to avoid throwing on module import
  const REGION = process.env.S3_REGION || "us-east-1";
  const BUCKET = process.env.S3_BUCKET;
  const ENDPOINT = process.env.S3_ENDPOINT; // e.g., https://objectstorage.<region>.oraclecloud.com or MinIO
  const FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE || "true").toLowerCase() === "true";
  const ACCESS_KEY = process.env.S3_ACCESS_KEY;
  const SECRET_KEY = process.env.S3_SECRET_KEY;

  if (!BUCKET || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error("S3 configuration missing: S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY are required");
  }

  const service = "s3";
  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = shortDate(amzDate);
  const credentialScope = `${dateStamp}/${REGION}/${service}/aws4_request`;

  const url = buildUrl({ bucket: BUCKET, region: REGION, endpoint: ENDPOINT, forcePathStyle: FORCE_PATH_STYLE, key });

  const qp = new URLSearchParams();
  qp.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  qp.set("X-Amz-Credential", `${encodeURIComponent(ACCESS_KEY)}/${credentialScope}`);
  qp.set("X-Amz-Date", amzDate);
  qp.set("X-Amz-Expires", String(expiresInSeconds));
  const signedHeaders = "host";
  qp.set("X-Amz-SignedHeaders", signedHeaders);

  const canonicalUri = url.pathname;
  const canonicalQuery = qp.toString();
  const canonicalHeaders = `host:${url.host}\n`;
  const hashedPayload = "UNSIGNED-PAYLOAD";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(SECRET_KEY, dateStamp, REGION, service);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const finalQs = new URLSearchParams(qp);
  finalQs.set("X-Amz-Signature", signature);
  const uploadUrl = `${url.origin}${canonicalUri}?${finalQs.toString()}`;

  const explicitPublic = process.env.S3_PUBLIC_URL;
  let publicUrl: string;
  if (explicitPublic) {
    publicUrl = `${explicitPublic.replace(/\/$/, "")}/${key}`;
  } else if (!ENDPOINT && REGION) {
    publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  } else if (ENDPOINT) {
    if (FORCE_PATH_STYLE) {
      publicUrl = `${ENDPOINT.replace(/\/$/, "")}/${BUCKET}/${key}`;
    } else {
      const u = new URL(ENDPOINT.replace(/\/$/, ""));
      publicUrl = `${u.protocol}//${BUCKET}.${u.host}/${key}`;
    }
  } else {
    publicUrl = `/${key}`; // Fallback
  }

  return { uploadUrl, key, publicUrl };
}

