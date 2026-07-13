import { NextRequest } from "next/server";
import type { TestRole, TestUser } from "./test-data";

export function testRequest(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    user?: Pick<TestUser, "id" | "role">;
  } = {},
) {
  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.user) {
    headers.set(
      "cookie",
      `session_user_id=${options.user.id}; session_role=${options.user.role as TestRole}`,
    );
  }

  return new NextRequest(`http://localhost${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

export function routeContext(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}

export async function responseJson<T = unknown>(response: Response) {
  return (await response.json()) as T;
}
