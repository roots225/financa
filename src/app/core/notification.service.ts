import { Injectable, computed, signal } from '@angular/core';

export type NotificationCategory = 'risk' | 'bank' | 'tax' | 'accounting' | 'security';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  category: NotificationCategory;
  priority: NotificationPriority;
  route?: string;
  actionLabel?: string;
  badge?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Alerte Ratio DSO & BFR',
    message: 'Le délai de recouvrement clients (DSO) a franchi le seuil prudentiel fixé à 75 jours (78,4 jours au 31/12/2024).',
    timestamp: 'Il y a 14 min',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    read: false,
    category: 'risk',
    priority: 'critical',
    route: '/analyse-risques',
    actionLabel: 'Examiner le ratio',
    badge: 'Covenant Clé',
  },
  {
    id: 'notif-2',
    title: 'Syndication Bancaire — SGBCI',
    message: 'Société Générale CI a validé la prorogation de la ligne de crédit court terme (850M XAF) sous condition de nantissement du stock.',
    timestamp: 'Il y a 1 heure',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    category: 'bank',
    priority: 'high',
    route: '/dossier-banques',
    actionLabel: 'Voir le dossier bancaire',
    badge: 'Financement',
  },
  {
    id: 'notif-3',
    title: 'Comptabilité : 3 écritures non lettrées',
    message: 'Des écarts de lettrage subsistent sur le compte fournisseur 401100 (TOTAL ÉNERGIES) pour un montant résiduel de 14 250 000 XAF.',
    timestamp: 'Il y a 3 heures',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false,
    category: 'accounting',
    priority: 'medium',
    route: '/tenue-comptable',
    actionLabel: 'Accéder au lettrage',
    badge: 'Lettrage',
  },
  {
    id: 'notif-4',
    title: 'Échéance DGI : Liasse Fiscale 2024',
    message: 'Rappel réglementaire : le dépôt dématérialisé de la liasse SYSCOHADA auprès de la DGI expire dans 12 jours.',
    timestamp: 'Hier à 17:40',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    category: 'tax',
    priority: 'high',
    route: '/liasse-fiscale',
    actionLabel: 'Télé-déclarer',
    badge: 'SYSCOHADA / DGI',
  },
  {
    id: 'notif-5',
    title: 'Comité de Crédit : Vote requis',
    message: 'Le dossier SOCOTRA SA (Tranche d’investissement 1,2 Md XAF) est en attente de validation collégiale par les membres du comité.',
    timestamp: 'Hier à 11:15',
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    read: true,
    category: 'bank',
    priority: 'medium',
    route: '/comite-credit',
    actionLabel: 'Voter au comité',
    badge: 'Délibération',
  },
  {
    id: 'notif-6',
    title: 'Audit & Sécurité eIDAS',
    message: 'Certificat cryptographique matériel FIPS 140-2 vérifié avec succès pour la signature de la liasse certifiée.',
    timestamp: 'Il y a 2 jours',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    read: true,
    category: 'security',
    priority: 'info',
    route: '/parametres',
    actionLabel: 'Historique de sécurité',
    badge: 'Audit Cryptographique',
  },
];

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>(INITIAL_NOTIFICATIONS);

  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.read).length,
  );

  markAsRead(id: string): void {
    this._notifications.update((items) =>
      items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  toggleRead(id: string): void {
    this._notifications.update((items) =>
      items.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }

  markAllAsRead(): void {
    this._notifications.update((items) =>
      items.map((n) => ({ ...n, read: true })),
    );
  }

  delete(id: string): void {
    this._notifications.update((items) => items.filter((n) => n.id !== id));
  }

  deleteAllRead(): void {
    this._notifications.update((items) => items.filter((n) => !n.read));
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  add(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void {
    const newItem: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this._notifications.update((items) => [newItem, ...items]);
  }
}
