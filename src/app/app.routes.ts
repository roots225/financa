import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Tableau de bord — Finança',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'tenue-comptable',
    title: 'Tenue comptable — Finança',
    loadComponent: () =>
      import('./pages/tenue-comptable/tenue-comptable').then((m) => m.TenueComptablePage),
  },
  {
    path: 'etats-financiers',
    title: 'États financiers & Bilan — Finança',
    loadComponent: () =>
      import('./pages/etats-financiers/etats-financiers').then((m) => m.EtatsFinanciersPage),
  },
  {
    path: 'analyse-risques',
    title: 'Analyse des risques — Finança',
    loadComponent: () =>
      import('./pages/analyse-risques/analyse-risques').then((m) => m.AnalyseRisquesPage),
  },
  {
    path: 'dossier-banques',
    title: 'Dossier & Banques — Finança',
    loadComponent: () =>
      import('./pages/dossier-banques/dossier-banques').then((m) => m.DossierBanquesPage),
  },
  {
    path: 'comite-credit',
    title: 'Portail Comité de Crédit — Finança',
    loadComponent: () =>
      import('./pages/comite-credit/comite-credit').then((m) => m.ComiteCreditPage),
  },
  { path: 'portail-comite-de-credit', redirectTo: 'comite-credit' },
  {
    path: 'liasse-fiscale',
    title: 'Liasse Fiscale SYSCOHADA & DGI — Finança',
    loadComponent: () =>
      import('./pages/liasse-fiscale/liasse-fiscale').then((m) => m.LiasseFiscalePage),
  },
  { path: 'liasse-fiscale-et-dgi', redirectTo: 'liasse-fiscale' },
  {
    path: 'analyses-previsionnel',
    title: 'Analyses & Prévisionnel 2025 — Finança',
    loadComponent: () =>
      import('./pages/analyses-previsionnel/analyses-previsionnel').then(
        (m) => m.AnalysesPrevisionnelPage,
      ),
  },
  {
    path: 'imports',
    title: 'Imports & Intégrations — Finança',
    loadComponent: () => import('./pages/imports/imports').then((m) => m.ImportsPage),
  },
  {
    path: 'login',
    title: 'Connexion Institutionnelle — Finança',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'parametres',
    title: 'Paramètres & Gouvernance — Finança',
    loadComponent: () => import('./pages/parametres/parametres').then((m) => m.ParametresPage),
  },
  {
    path: 'notifications',
    title: 'Centre de Notifications & Alertes — Finança',
    loadComponent: () =>
      import('./pages/notifications/notifications').then((m) => m.NotificationsPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
