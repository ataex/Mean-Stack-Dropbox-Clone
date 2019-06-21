import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FileEditDialogComponent } from './file-edit.component';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  fileName: string;
  fileId: string;
}

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 4;
  pageSizeOptions = [1, 2, 5, 10];
  currentPage = 1;
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  animal: string;
  name: string;

  postTiles: Tile[] = [
    {fileName: 'One', cols: 3, rows: 1, color: 'lightblue', fileId: null},
    {fileName: 'Two', cols: 1, rows: 2, color: 'lightgreen', fileId: null},
    {fileName: 'Three', cols: 1, rows: 1, color: 'lightpink', fileId: null},
    {fileName: 'Four', cols: 2, rows: 1, color: '#DDBDF1', fileId: null},
  ];

  constructor(
    public postsService: PostsService,
    private authService: AuthService,
    public dialog: MatDialog
    ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, 1);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
        for (let i = 0; i < postData.postCount; i++) {
          this.postTiles[i].fileName = this.posts[i].fileName;
          this.postTiles[i].fileId = this.posts[i].id;
        }
      });
    this.userIsAuthenticated = this.authService.getisAuth();
    this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FileEditDialogComponent, {
      width: '250px',
      data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId)
    .subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }

  tileMouseover(postTile) {
    for (let i = 0; i < this.postTiles.length; i++ ) {
      if (this.postTiles[i].fileId === postTile.fileId) {
        this.postTiles[i].color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
      }
    }
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
