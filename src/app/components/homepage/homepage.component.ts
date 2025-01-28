import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-homepage',
  imports: [RouterLink],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [ // When element enters the DOM
        style({ opacity: 0, transform: 'translateY(50px)' }), 
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class HomepageComponent {

}
