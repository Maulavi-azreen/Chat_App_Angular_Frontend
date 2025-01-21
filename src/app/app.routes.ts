import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatMainComponent } from './components/chat-main/chat-main.component';


export const routes: Routes = [
    {path:'',component:HomepageComponent},
    {path:'login',component:LoginComponent},
    {path:'signup',component:SignupComponent},
    {path:'chat',component:ChatMainComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
