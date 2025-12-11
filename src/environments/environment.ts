// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  appName: "ServiceDesk Pro",
  appVersion: "1.0.0",
  apiUrl: "http://localhost:3000/api",
  storagePrefix: "sd_",
  maxStorageSize: 4, // MB
  networkDelay: 400, // ms (simulating API latency)
};
