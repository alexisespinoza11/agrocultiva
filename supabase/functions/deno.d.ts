// Type definitions for Supabase Edge Functions / Deno runtime
// This file provides ambient types for editors and TypeScript tooling when the Deno LSP is not active.

declare namespace Deno {
  interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    has(key: string): boolean;
    toObject(): Record<string, string>;
  }

  const env: Env;

  function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
  function serve(
    options: ServeOptions,
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}
