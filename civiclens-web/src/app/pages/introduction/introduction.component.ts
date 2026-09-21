import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-introduction',
  imports: [RouterModule],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css',
})
export class IntroductionComponent {
  private readonly router = inject(Router);
  protected proceedToCreateWorkspace(): void {
    this.router.navigate(['/workspace']);
  }
}
