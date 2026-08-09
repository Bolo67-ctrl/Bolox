import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  createClient,
} from "@supabase/supabase-js";

/* =========================================
   FIREBASE ADMIN
========================================= */

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.FIREBASE_PROJECT_ID,

      clientEmail:
        process.env.FIREBASE_CLIENT_EMAIL,

      privateKey:
        process.env.FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
    }),
  });
}

/* =========================================
   SUPABASE SERVER CLIENT
========================================= */

const supabaseAdmin =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

/* =========================================
   HELPERS
========================================= */

function json(data, status = 200) {
  return Response.json(
    data,
    {
      status,
    }
  );
}

function safeText(value) {
  return String(value || "")
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
}

/* =========================================
   POST /api/upload-file
========================================= */

export async function POST(request) {
  try {
    /* -------------------------------------
       CHECK ENV
    ------------------------------------- */

    if (
      !process.env.ADMIN_UID ||
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY ||
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
       FIREBASE TOKEN
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
      authorization.substring(7);

    let decodedToken;

    try {
      decodedToken =
        await getAuth().verifyIdToken(
          idToken
        );
    } catch (error) {
      console.error(
        "Firebase token error:",
        error
      );

      return json(
        {
          error:
            "Invalid login session.",
        },
        401
      );
    }

    /* -------------------------------------
       ADMIN CHECK
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
       FORM DATA
    ------------------------------------- */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const productId =
      formData.get("productId");

    if (
      !productId ||
      typeof productId !== "string"
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

    /*
      Keep this under Vercel's request
      body limit.

      We use 4 MB here to leave room
      for multipart/form-data overhead.
    */

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
       SAFE STORAGE PATH
    ------------------------------------- */

    const safeProductId =
      safeText(productId);

    const safeFileName =
      safeText(file.name) ||
      "product-file";

    const storagePath =
      `${safeProductId}/${Date.now()}-${safeFileName}`;

    /* -------------------------------------
       FILE → ARRAY BUFFER
    ------------------------------------- */

    const arrayBuffer =
      await file.arrayBuffer();

    const fileBytes =
      new Uint8Array(
        arrayBuffer
      );

    /* -------------------------------------
       PRIVATE SUPABASE UPLOAD
    ------------------------------------- */

    const {
      data,
      error: uploadError,
    } =
      await supabaseAdmin.storage
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

            upsert: false,
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
            "Upload failed.",
        },
        500
      );
    }

    /* -------------------------------------
       SUCCESS
    ------------------------------------- */

    return json({
      success: true,

      path:
        data.path,

      productId:
        safeProductId,

      fileName:
        safeFileName,
    });
  } catch (error) {
    console.error(
      "Upload function error:",
      error
    );

    return json(
      {
        error:
          "Could not upload the file.",
      },
      500
    );
  }
}