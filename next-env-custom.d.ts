import { NextRequest, NextResponse } from 'next/server';

declare module 'next/server' {
  export interface AppRouteHandlerContext {
    params: Record<string, string | string[]>;
  }

  export type AppRouteHandlerFn = (
    request: NextRequest,
    context: AppRouteHandlerContext
  ) => Promise<Response> | Response;
} 