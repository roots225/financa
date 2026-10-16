import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { ToastService } from '../../core/toast.service';

type RoleType = 'pme' | 'bank' | 'auditor';

interface RoleConfig {
  id: RoleType;
  title: string;
  subtitle: string;
  badge: string;
  placeholder: string;
  defaultEmail: string;
  icon: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideIconComponent],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly selectedRole = signal<RoleType>('pme');
  readonly showPassword = signal(false);
  readonly mfaMethod = signal<'otp' | 'pki'>('otp');
  readonly rememberMe = signal(true);
  readonly authState = signal<'idle' | 'authenticating' | 'success'>('idle');

  userCredential = 'directeur.financier@sogecor-uemoa.sn';
  passwordField = 'SYSCOHADA-Enterprise#2025';

  readonly roles: Record<RoleType, RoleConfig> = {
    pme: {
      id: 'pme',
      title: 'Entreprise / PME',
      subtitle: 'Trésorerie & États OHADA',
      badge: 'SIRET / Matricule PME',
      placeholder: 'ex: a.traore@societe-distribution.ci',
      defaultEmail: 'directeur.financier@sogecor-uemoa.sn',
      icon: 'building',
    },
    bank: {
      id: 'bank',
      title: 'Banque & Prêteur',
      subtitle: 'Comité Risque & Décision',
      badge: 'Code Swift / Matricule Risque',
      placeholder: 'ex: analyste.credit@ecobank.com',
      defaultEmail: 'kone.cheick@boad-institution.int',
      icon: 'landmark',
    },
    auditor: {
      id: 'auditor',
      title: 'Tiers / Auditeur',
      subtitle: 'ONECCA & Certification',
      badge: 'Agrément ONECCA / N° Registre',
      placeholder: 'ex: contact@cabinet-kpmg-ci.com',
      defaultEmail: 'expert.syscohada@audit-regional.ci',
      icon: 'shield-check',
    },
  };

  selectRole(role: RoleType): void {
    this.selectedRole.set(role);
    this.userCredential = this.roles[role].defaultEmail;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  handleAuth(event: Event): void {
    event.preventDefault();
    if (this.authState() !== 'idle') return;

    this.authState.set('authenticating');

    setTimeout(() => {
      this.authState.set('success');
      this.toast.show(
        `Session institutionnelle validée via Certificat HSM SHA-256 (${this.roles[this.selectedRole()].title})`,
        'success',
        'check-circle'
      );

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    }, 1200);
  }
}
