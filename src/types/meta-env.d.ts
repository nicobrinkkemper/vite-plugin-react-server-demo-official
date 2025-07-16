import type { CustomInterface } from 'vite-plugin-react-server/types';
import React from 'react';

// Create a custom interface using your React types
type MyInterface = CustomInterface<React.ReactNode>;

declare global {    
  interface ImportMetaEnv {
    readonly BASE_URL: string;
    readonly PUBLIC_ORIGIN: string;
  }
  interface ViteReactServerComponentsPlugin extends MyInterface{
  }
}       

export {};