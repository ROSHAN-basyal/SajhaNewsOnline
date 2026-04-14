import type { NextResponse } from "next/server";

const DEFAULT_LOCAL_ADMIN_USERNAME = "admin";
const DEFAULT_LOCAL_ADMIN_PASSWORD = "admin";
const LOCAL_ADMIN_SESSION_TOKEN = "local-dev-admin-session";

const isTruthy = (value?: string) => {
  if (!value) return false;
  return !["0", "false", "no", "off"].includes(value.trim().toLowerCase());
};

export const isLocalAdminEnabled =
  process.env.NODE_ENV !== "production" &&
  isTruthy(process.env.ENABLE_LOCAL_ADMIN_LOGIN || "true");

export const localAdminUsername =
  process.env.LOCAL_ADMIN_USERNAME?.trim() || DEFAULT_LOCAL_ADMIN_USERNAME;

export const localAdminPassword =
  process.env.LOCAL_ADMIN_PASSWORD?.trim() || DEFAULT_LOCAL_ADMIN_PASSWORD;

export const matchesLocalAdminCredentials = (
  username?: string,
  password?: string
) =>
  isLocalAdminEnabled &&
  username === localAdminUsername &&
  password === localAdminPassword;

export const isLocalAdminSession = (sessionToken?: string | null) =>
  isLocalAdminEnabled && sessionToken === LOCAL_ADMIN_SESSION_TOKEN;

export const getLocalAdminUser = () => ({
  id: "local-admin",
  username: localAdminUsername,
});

export const setAdminSessionCookie = (
  response: NextResponse,
  sessionToken: string
) => {
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
  });
};

export const setLocalAdminSessionCookie = (response: NextResponse) =>
  setAdminSessionCookie(response, LOCAL_ADMIN_SESSION_TOKEN);

