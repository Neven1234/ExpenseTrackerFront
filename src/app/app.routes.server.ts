import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Every screen is behind a token held in the browser, so render on the client.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
