import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent,{ ...appConfig,
  providers: [
    ...(appConfig.providers || []), // Include existing providers from appConfig if any
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations(),
  ],
})
  .catch((err) => console.error(err));
