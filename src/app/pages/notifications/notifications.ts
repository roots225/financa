import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { AppNotification, NotificationCategory, NotificationService } from '../../core/notification.service';
import { ConfirmDialogService } from '../../core/confirm-dialog.service';
import { ToastService } from '../../core/toast.service';

type FilterTab = 'all' | 'unread' | NotificationCategory;

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [RouterLink, LucideIconComponent],
  templateUrl: './notifications.html',
})
export class NotificationsPage {
  protected readonly notifService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly selectedTab = signal<FilterTab>('all');
  readonly searchQuery = signal<string>('');

  readonly stats = computed(() => {
    const list = this.notifService.notifications();
    return {
      total: list.length,
      unread: list.filter((n) => !n.read).length,
      critical: list.filter((n) => n.priority === 'critical' || n.priority === 'high').length,
      bank: list.filter((n) => n.category === 'bank').length,
    };
  });

  readonly filteredNotifications = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tab = this.selectedTab();
    let list = this.notifService.notifications();

    if (tab === 'unread') {
      list = list.filter((n) => !n.read);
    } else if (tab !== 'all') {
      list = list.filter((n) => n.category === tab);
    }

    if (query) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          (n.badge && n.badge.toLowerCase().includes(query)),
      );
    }

    return list;
  });

  setTab(tab: FilterTab): void {
    this.selectedTab.set(tab);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead();
    this.toast.info('Toutes les notifications ont été marquées comme lues.');
  }

  toggleRead(notif: AppNotification): void {
    this.notifService.toggleRead(notif.id);
  }

  async deleteNotification(notif: AppNotification): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Supprimer la notification',
      message: `Voulez-vous supprimer définitivement l'alerte "${notif.title}" ?`,
      tone: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Conserver',
      icon: 'trash-2',
      action: async () => {
        // Small delay for natural UI feel
        await new Promise((r) => setTimeout(r, 250));
        this.notifService.delete(notif.id);
      },
    });

    if (confirmed) {
      this.toast.info('Notification supprimée.');
    }
  }

  async deleteReadNotifications(): Promise<void> {
    const readCount = this.notifService.notifications().filter((n) => n.read).length;
    if (readCount === 0) {
      this.toast.info('Aucune notification lue à supprimer.');
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Supprimer les notifications lues',
      message: `Êtes-vous sûr de vouloir supprimer les ${readCount} notification(s) déjà lue(s) ? Cette action est irréversible.`,
      tone: 'warning',
      confirmText: 'Supprimer les lues',
      cancelText: 'Annuler',
      icon: 'trash-2',
      action: async () => {
        await new Promise((r) => setTimeout(r, 350));
        this.notifService.deleteAllRead();
      },
    });

    if (confirmed) {
      this.toast.info(`${readCount} notification(s) lue(s) supprimée(s).`);
    }
  }

  async clearAllNotifications(): Promise<void> {
    const total = this.notifService.notifications().length;
    if (total === 0) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Vider tout le centre de notifications',
      message: `Attention : vous allez supprimer l'intégralité des ${total} notifications et alertes de gouvernance.`,
      tone: 'danger',
      confirmText: 'Vider toutes les notifications',
      cancelText: 'Annuler',
      icon: 'trash',
      action: async () => {
        await new Promise((r) => setTimeout(r, 400));
        this.notifService.clearAll();
      },
    });

    if (confirmed) {
      this.toast.info('Toutes les notifications ont été supprimées.');
    }
  }

  getCategoryLabel(category: NotificationCategory): string {
    switch (category) {
      case 'risk':
        return 'Risques & Covenants';
      case 'bank':
        return 'Banques & Syndication';
      case 'tax':
        return 'Fiscalité SYSCOHADA';
      case 'accounting':
        return 'Tenue & Lettrage';
      case 'security':
        return 'Sécurité & eIDAS';
      default:
        return 'Général';
    }
  }

  getCategoryIcon(category: NotificationCategory): string {
    switch (category) {
      case 'risk':
        return 'shield-alert';
      case 'bank':
        return 'wallet';
      case 'tax':
        return 'file-text';
      case 'accounting':
        return 'book-open';
      case 'security':
        return 'shield-check';
      default:
        return 'bell';
    }
  }
}
