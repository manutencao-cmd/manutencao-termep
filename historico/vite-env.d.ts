/// <reference types="vite/client" />

// Add AbortSignal timeout support if not available
interface AbortSignal {
  timeout?: (delay: number) => AbortSignal;
}

interface AbortSignalConstructor {
  timeout?: (delay: number) => AbortSignal;
}