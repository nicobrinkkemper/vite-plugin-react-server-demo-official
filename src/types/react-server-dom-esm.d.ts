declare module 'react-server-dom-esm/client' {
  export function createFromFetch<T>(promise: Promise<Response>): Promise<T>
}

declare module 'react-server-dom-esm/server.node' {
  export function renderToPipeableStream(
    element: React.ReactNode,
    options?: {
      onError?: (error: Error) => void
      onPostpone?: (reason: string) => void
      onShellReady?: () => void
      onShellError?: (error: Error) => void
      onAllReady?: () => void
      bootstrapScripts?: string[]
      bootstrapModules?: string[]
      unstable_postpone?: boolean
    }
  ): {
    pipe: (writable: NodeJS.WritableStream) => void
  }
} 