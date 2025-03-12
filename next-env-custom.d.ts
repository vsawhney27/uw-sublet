import type { NextRequest } from 'next/server';

declare module 'next/server' {
  interface RouteHandlerContext<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> {
    params: TParams;
  }

  type RouteSegment<TParam extends string | number | boolean = string> = {
    [key: string]: TParam;
  };

  type RouteHandler<TParams extends RouteSegment = RouteSegment> = (
    request: NextRequest,
    context: RouteHandlerContext<TParams>
  ) => Promise<Response> | Response;
}