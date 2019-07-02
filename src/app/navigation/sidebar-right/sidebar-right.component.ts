import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostListComponent } from '../../posts/post-list/post-list.component';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.css'],
  providers: [PostListComponent]
})

export class SidebarRightComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  searchForm: FormGroup;

  constructor(private authService: AuthService, private postList: PostListComponent) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getisAuth();
    this.authListenerSubs = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
    this.searchForm = new FormGroup({
      searchString: new FormControl(null, {
        validators: [Validators.minLength(3)]
      })
    });
  }

  onSearch() {
    this.postList.onSearch(
      this.searchForm.value.searchString
    );
    this.searchForm.reset();
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
