import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Adjust the path as needed
import { User } from '../services/user.service'; // Ensure User type is imported if used

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userEmail: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.userEmail = user?.email || null;
    });
  }
}
