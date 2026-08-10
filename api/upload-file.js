import {
  createVerify,
} from "node:crypto";

import {
  createClient,
} from "@supabase/supabase-js";

/* =========================================
   FIREBASE PUBLIC CERTIFICATES
========================================= */

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

/* =========================================
   SUPABASE ADMIN CLIENT
========================================= */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase server environment variables are missing."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/* =========================================
   JSON RESPONSE
========================================= */

function json(
  data,
  status = 200
) {
  return Response.json(
    data,
    {
      status,
    }
  );
}

/* =========================================
   BASE64 URL DECODE
========================================= */

function base64UrlDecode(
  value
) {
  let base64 =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  while (
    base64.length % 4
  ) {
    base64 += "=";
  }

  return Buffer.from(
    base64,
    "base64"
  );
}

/* =========================================
   PARSE JWT
========================================= */

function parseJwt(token) {
  const parts =
    token.split(".");

  if (
    parts.length !== 3
  ) {
    throw new Error(
      "Invalid Firebase token format."
    );
  }

  const [
    encodedHeader,
    encodedPayload,
    encodedSignature,
  ] = parts;

  let header;
  let payload;

  try {
    header =
      JSON.parse(
        base64UrlDecode(
          encodedHeader
        ).toString("utf8")
      );

    payload =
      JSON.parse(
        base64UrlDecode(
          encodedPayload
        ).toString("utf8")
      );
  } catch {
    throw new Error(
      "Could not decode Firebase token."
    );
  }

  return {
    header,
    payload,

    signingInput:
      `${encodedHeader}.${encodedPayload}`,

    signature:
      base64UrlDecode(
        encodedSignature
      ),
  };
}

/* =========================================
   LOAD FIREBASE CERTIFICATES
========================================= */

async function getFirebaseCerts() {
  const response =
    await fetch(
      FIREBASE_CERTS_URL
    );

  if (!response.ok) {
    throw new Error(
      "Could not load Firebase signing certificates."
    );
  }

  return response.json();
}

/* =========================================
   VERIFY FIREBASE ID TOKEN
========================================= */

async function verifyFirebaseToken(
  token
) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      "FIREBASE_PROJECT_ID is missing."
    );
  }

  const {
    header,
    payload,
    signingInput,
    signature,
  } = parseJwt(token);

  /* -------------------------------------
     HEADER CHECKS
  ------------------------------------- */

  if (
    header.alg !== "RS256"
  ) {
    throw new Error(
      "Invalid Firebase token algorithm."
    );
  }

  if (
    !header.kid ||
    typeof header.kid !==
      "string"
  ) {
    throw new Error(
      "Firebase token is missing a key ID."
    );
  }

  /* -------------------------------------
     CERTIFICATE
  ------------------------------------- */

  const certificates =
    await getFirebaseCerts();

  const certificate =
    certificates[
      header.kid
    ];

  if (!certificate) {
    throw new Error(
      "Firebase signing certificate was not found."
    );
  }

  /* -------------------------------------
     SIGNATURE CHECK
  ------------------------------------- */

  const verifier =
    createVerify(
      "RSA-SHA256"
    );

  verifier.update(
    signingInput
  );

  verifier.end();

  const validSignature =
    verifier.verify(
      certificate,
      signature
    );

  if (!validSignature) {
    throw new Error(
      "Invalid Firebase token signature."
    );
  }

  /* -------------------------------------
     CLAIM CHECKS
  ------------------------------------- */

  const now =
    Math.floor(
      Date.now() / 1000
    );

  if (
    payload.aud !==
    projectId
  ) {
    throw new Error(
      "Invalid Firebase token audience."
    );
  }

  const expectedIssuer =
    `https://securetoken.google.com/${projectId}`;

  if (
    payload.iss !==
    expectedIssuer
  ) {
    throw new Error(
      "Invalid Firebase token issuer."
    );
  }

  if (
    typeof payload.exp !==
      "number" ||
    payload.exp <= now
  ) {
    throw new Error(
      "Firebase login session has expired."
    );
  }

  if (
    typeof payload.iat !==
      "number" ||
    payload.iat > now
  ) {
    throw new Error(
      "Invalid Firebase token issued time."
    );
  }

  if (
    typeof payload.auth_time !==
      "number" ||
    payload.auth_time > now
  ) {
    throw new Error(
      "Invalid Firebase authentication time."
    );
  }

  if (
    !payload.sub ||
    typeof payload.sub !==
      "string"
  ) {
    throw new Error(
      "Firebase token has no user ID."
    );
  }

  return {
    uid:
      payload.sub,

    payload,
  };
}

/* =========================================
   SAFE FILE PATH TEXT
========================================= */

function safeText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
}

/* =========================================
   POST /api/upload-file
========================================= */

export async function POST(
  request
) {
  try {
    /* -------------------------------------
       REQUIRED ENVIRONMENT VARIABLES
    ------------------------------------- */

    if (
      !process.env.ADMIN_UID ||
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return json(
        {
          error:
            "Server environment variables are missing.",
        },
        500
      );
    }

    /* -------------------------------------
       AUTHORIZATION HEADER
    ------------------------------------- */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return json(
        {
          error:
            "Authentication required.",
        },
        401
      );
    }

    const idToken =
      authorization.slice(7);

    /* -------------------------------------
       VERIFY FIREBASE TOKEN
    ------------------------------------- */

    let decodedToken;

    try {
      decodedToken =
        await verifyFirebaseToken(
          idToken
        );
    } catch (error) {
      console.error(
        "Firebase verification error:",
        error
      );

      return json(
        {
          error:
            error.message ||
            "Invalid login session.",
        },
        401
      );
    }

    /* -------------------------------------
       ADMIN ONLY
    ------------------------------------- */

    if (
      decodedToken.uid !==
      process.env.ADMIN_UID
    ) {
      return json(
        {
          error:
            "Admin access required.",
        },
        403
      );
    }

    /* -------------------------------------
       READ FORM DATA
    ------------------------------------- */

    const formData =
      await request.formData();

    const productId =
      formData.get(
        "productId"
      );

    const file =
      formData.get(
        "file"
      );

    if (
      !productId ||
      typeof productId !==
        "string"
    ) {
      return json(
        {
          error:
            "Product ID is required.",
        },
        400
      );
    }

    if (
      !file ||
      typeof file.arrayBuffer !==
        "function"
    ) {
      return json(
        {
          error:
            "A product file is required.",
        },
        400
      );
    }

    /* -------------------------------------
       FILE SIZE LIMIT
    ------------------------------------- */

    const maxFileSize =
      4 * 1024 * 1024;

    if (
      file.size >
      maxFileSize
    ) {
      return json(
        {
          error:
            "For now, choose a file smaller than 4 MB.",
        },
        413
      );
    }

    /* -------------------------------------
       SAFE PATH
    ------------------------------------- */

    const safeProductId =
      safeText(
        productId
      );

    const safeFileName =
      safeText(
        file.name
      ) ||
      "product-file";

    if (!safeProductId) {
      return json(
        {
          error:
            "Invalid product ID.",
        },
        400
      );
    }

    const storagePath =
      `${safeProductId}/${Date.now()}-${safeFileName}`;

    /* -------------------------------------
       CONVERT FILE
    ------------------------------------- */

    const arrayBuffer =
      await file.arrayBuffer();

    const fileBytes =
      new Uint8Array(
        arrayBuffer
      );

    /* -------------------------------------
       SUPABASE PRIVATE UPLOAD
    ------------------------------------- */

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data,
      error: uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          "product-files"
        )
        .upload(
          storagePath,
          fileBytes,
          {
            contentType:
              file.type ||
              "application/octet-stream",

            upsert:
              false,
          }
        );

    if (uploadError) {
      console.error(
        "Supabase upload error:",
        uploadError
      );

      return json(
        {
          error:
            uploadError.message ||
            "Supabase upload failed.",
        },
        500
      );
    }

    /* -------------------------------------
       SUCCESS
    ------------------------------------- */

    return json(
      {
        success:
          true,

        productId:
          safeProductId,

        path:
          data.path,

        fileName:
          safeFileName,

        size:
          file.size,
      },
      200
    );
  } catch (error) {
    console.error(
      "Upload function error:",
      error
    );

    return json(
      {
        error:
          error.message ||
          "Could not upload the file.",
      },
      500
    );
  }
}