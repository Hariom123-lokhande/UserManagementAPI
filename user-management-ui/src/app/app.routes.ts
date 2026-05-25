import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
////import { Home } from './pages/home/home';
//import { UserList } from './pages/user-list/user-list';
//import { UserForm } from './pages/user-form/user-form';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',

    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },

  // REGISTER PAGE
  {
    path: 'register',

    loadComponent: () =>
      import('./pages/register/register')
        .then(m => m.Register)
  },

  {
    path: 'home',
    // component: Home
    canActivate: [authGuard],

    loadComponent: () =>
      import('./pages/home/home')
   .then(m => m.Home)
                                                                              //which url open in which page
  },

  {
    path: 'users',

    canActivate: [authGuard],
    //component: UserList

    loadComponent: () =>
      import('./pages/user-list/user-list')
.then(m=> m.UserList)
  },

  {
    path: 'users/add',
    canActivate: [authGuard],
    //component: UserForm
    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(m => m.UserForm)
  },
  {
    path: 'users/edit/:id',
    canActivate: [authGuard],
   // component: UserForm
    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(m => m.UserForm)
  },

  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found')
        .then(m => m.PageNotFound)
  }
];
