import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FinanceService } from './core/finance.service';
import { ToastService } from './core/toast.service';
import { NotificationService } from './core/notification.service';
import { ConfirmDialogService } from './core/confirm-dialog.service';
import { LucideIconComponent } from './core/lucide-icon.component';
import { ConfirmDialogComponent } from './core/confirm-dialog.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideIconComponent, ConfirmDialogComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly fin = inject(FinanceService);
  protected readonly toast = inject(ToastService);
  protected readonly notifService = inject(NotificationService);
  protected readonly confirmDialog = inject(ConfirmDialogService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly mobileNavOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly isLogin = signal(false);

  // Dropdown states
  readonly notificationDropdownOpen = signal(false);
  readonly userMenuOpen = signal(false);

  protected readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard & Score', icon: 'line-chart' },
    { path: '/tenue-comptable', label: 'Tenue comptable', icon: 'book-open' },
    { path: '/etats-financiers', label: 'États & Bilan (OHADA)', icon: 'landmark' },
    { path: '/liasse-fiscale', label: 'Liasse Fiscale & DGI', icon: 'file-text' },
    { path: '/analyse-risques', label: 'Analyse des risques', icon: 'shield-check' },
    { path: '/dossier-banques', label: 'Dossier & Banques', icon: 'wallet' },
    { path: '/comite-credit', label: 'Comité de Crédit', icon: 'vote' },
    { path: '/analyses-previsionnel', label: 'Analyses & Prévisionnel', icon: 'sparkles' },
    { path: '/imports', label: 'Imports & Intégrations', icon: 'arrow-left-right' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.mobileNavOpen.set(false);
        this.notificationDropdownOpen.set(false);
        this.userMenuOpen.set(false);
        this.isLogin.set(e.urlAfterRedirects.startsWith('/login') || e.url.startsWith('/login'));
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleNotificationDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.userMenuOpen.set(false);
    this.notificationDropdownOpen.update((v) => !v);
  }

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationDropdownOpen.set(false);
    this.userMenuOpen.update((v) => !v);
  }

  closeAllDropdowns(): void {
    this.notificationDropdownOpen.set(false);
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const headerRight = this.elementRef.nativeElement.querySelector('#header-actions-area');
    if (headerRight && !headerRight.contains(target)) {
      this.closeAllDropdowns();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeAllDropdowns();
  }

  async confirmLogout(): Promise<void> {
    this.closeAllDropdowns();

    const confirmed = await this.confirmDialog.confirm({
      title: 'Déconnexion institutionnelle',
      message: 'Êtes-vous certain de vouloir vous déconnecter de la plateforme Finança ?',
      description: 'Vos jetons d’authentification eIDAS et clés de session de chiffrement seront immédiatement révoqués.',
      tone: 'danger',
      confirmText: 'Se déconnecter',
      cancelText: 'Rester connecté',
      icon: 'log-out',
      action: async () => {
        // Simulate cryptographic session clearance & server revocation
        await new Promise((r) => setTimeout(r, 650));
      },
    });

    if (confirmed) {
      this.toast.info('Session institutionnelle clôturée avec succès.');
      this.router.navigate(['/login']);
    }
  }
}
