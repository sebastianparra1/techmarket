import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./environments/firebase.config";

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

//import { defineCustomElements } from '@codetrix-studio/capacitor-google-auth/dist/loader';
//defineCustomElements(window);
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'; // 👈 IMPORTANTE

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
initializeApp(firebaseConfig);
GoogleAuth.initialize(); // 👈 ESTA LÍNEA ES FUNDAMENTAL