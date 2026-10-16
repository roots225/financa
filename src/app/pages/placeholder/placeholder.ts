import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideIconComponent } from '../../core/lucide-icon.component';

@Component({
  selector: 'app-placeholder',
  imports: [RouterLink, LucideIconComponent],
  template: `
    <section class="card mx-auto flex max-w-xl flex-col items-center gap-3 p-10 text-center">
      <div class="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-xl text-white">
        <lucide-icon [name]="data()?.['icon'] ?? 'wrench'" size="24" />
      </div>
      <h1 class="text-headline-md font-bold">{{ data()?.['title'] ?? 'Page' }}</h1>
      <p class="text-body-md text-on-surface-variant">
        Cet écran sera construit dès réception de sa maquette.
      </p>
      <a routerLink="/dashboard" class="mt-2 inline-flex items-center gap-1 text-body-sm font-semibold text-primary hover:underline">
        <lucide-icon name="arrow-left" size="16" />
        Retour au tableau de bord
      </a>
    </section>
  `,
})
export class PlaceholderPage {
  protected readonly data = toSignal(inject(ActivatedRoute).data);
}
