import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  fileName: string;
  fileId: string;
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

  postTiles: Tile[] = [
    {fileName: 'One', cols: 3, rows: 1, color: 'lightblue', fileId: null},
    {fileName: 'Two', cols: 1, rows: 2, color: 'lightgreen', fileId: null},
    {fileName: 'Three', cols: 1, rows: 1, color: 'lightpink', fileId: null},
    {fileName: 'Four', cols: 2, rows: 1, color: '#DDBDF1', fileId: null},
  ];

  // tiles: Tile[] = [
  //   {text: null, cols: 3, rows: 1, color: 'lightblue'}
  // ];

  constructor(public postsService: PostsService, private authService: AuthService) {}

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

  tileMouseover(tile) {
    for (let i = 0; i < this.tiles.length; i++ ) {
      if (this.tiles[i].text === tile.text) {
        this.tiles[i].color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
      }
    }
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
