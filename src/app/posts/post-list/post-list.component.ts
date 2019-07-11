import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PageEvent, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FileEditDialogComponent } from './file-edit.component';

export interface Tile {
  fileId: string;
  fileName: string;
  filePath: string;
  fileAuthor: string;
  dateUploaded: Date;
  fileTags: string;
  dateLastModified: Date;
  userLastModified: string;
  checkedOut: boolean;
  cols: number;
  rows: number;
  color;
}

export interface DialogData {
  fileId: string;
  fileName: string;
  filePath: string;
  fileAuthor: string;
  dateUploaded: Date;
  fileTags: string;
  dateLastModified: Date;
  userLastModified: string;
  checkedOut: boolean;
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
  post: Post;
  searchString: string;
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  searchForm: FormGroup;

  postTiles: Tile[] = [];

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
        for (let i = 0; i < this.postsPerPage; i++) {
          if (this.posts[i].checkedOut === true) {
            this.postTiles.push({
              fileId: this.posts[i].id,
              fileName: this.posts[i].fileName,
              filePath: this.posts[i].filePath,
              fileAuthor: this.posts[i].fileAuthor,
              dateUploaded: this.posts[i].dateUploaded,
              fileTags: this.posts[i].fileTags,
              dateLastModified: this.posts[i].dateLastModified,
              userLastModified: this.posts[i].userLastModified,
              checkedOut: this.posts[i].checkedOut,
              cols: 1,
              rows: 2,
              color: '#FF0000'     //set color to red
            });
          } else {
              this.postTiles.push({
              fileId: this.posts[i].id,
              fileName: this.posts[i].fileName,
              filePath: this.posts[i].filePath,
              fileAuthor: this.posts[i].fileAuthor,
              dateUploaded: this.posts[i].dateUploaded,
              fileTags: this.posts[i].fileTags,
              dateLastModified: this.posts[i].dateLastModified,
              userLastModified: this.posts[i].userLastModified,
              checkedOut: this.posts[i].checkedOut,
              cols: 1,
              rows: 2,
              color: '#00FF00'      //set color to green
            });
          }
        }
      });
    this.userIsAuthenticated = this.authService.getisAuth();
    this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
    this.searchForm = new FormGroup({
      searchString: new FormControl(null, {
        validators: [Validators.minLength(3)]
      })
    });
  }

  onSearch() {
    
    this.searchString = this.searchForm.value.searchString;
    this.searchForm.reset();
  }

  openDialog(postTile): void {
    const dialogRef = this.dialog.open(FileEditDialogComponent, {
      width: '50%',
      data: {
        fileId: postTile.fileId,
        fileName: postTile.fileName,
        filePath: postTile.filePath,
        fileAuthor: postTile.fileAuthor,
        dateUploaded: postTile.dateUploaded,
        fileTags: postTile.fileTags,
        dateLastModified: postTile.dateLastModified,
        userLastModified: postTile.userLastModified,
        checkedOut: postTile.checkedOut
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.substring( 0, 4 ) === 'true') {
        result = result.slice( 4 );
        this.onDelete(result);
      } else if (result.substring( 0, 8 ) === 'checkOut') {
        result = result.slice( 8 );
        this.checkOutFile(result);
      } else if (result.substring( 0, 7) === 'checkIn') {
        result = result.slice( 7 );
        this.checkInFile(result);
      }
    });
  }

  checkInFile(fileId) {
    this.isLoading = true;
    this.postsService.getPost(fileId).subscribe(postData => {
      this.post = {
        id: postData._id,
        fileName: postData.fileName,
        filePath: postData.filePath,
        fileAuthor: postData.fileAuthor,
        dateUploaded: postData.dateUploaded,
        fileTags: postData.fileTags,
        dateLastModified: postData.dateLastModified,
        userLastModified: postData.userLastModified,
        checkedOut: false
      };
      this.postsService.updatePost(
        this.post.id,
        this.post.fileName,
        this.post.filePath,
        this.post.fileAuthor,
        this.post.dateUploaded,
        this.post.fileTags,
        this.post.dateLastModified,
        this.post.userLastModified,
        this.post.checkedOut
        );
      this.isLoading = false;
      location.reload();
    });
  }

  checkOutFile(fileId) {
    this.isLoading = true;
    this.postsService.getPost(fileId).subscribe(postData => {
      this.post = {
        id: postData._id,
        fileName: postData.fileName,
        filePath: postData.filePath,
        fileAuthor: postData.fileAuthor,
        dateUploaded: postData.dateUploaded,
        fileTags: postData.fileTags,
        dateLastModified: postData.dateLastModified,
        userLastModified: postData.userLastModified,
        checkedOut: true
      };
      this.postsService.updatePost(
        this.post.id,
        this.post.fileName,
        this.post.filePath,
        this.post.fileAuthor,
        this.post.dateUploaded,
        this.post.fileTags,
        this.post.dateLastModified,
        this.post.userLastModified,
        this.post.checkedOut
        );
      this.isLoading = false;
      location.reload();
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postTiles = [];
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

  // tileMouseover(postTile) {
  //   for (let i = 0; i < this.postTiles.length; i++ ) {
  //     if (this.postTiles[i].fileId === postTile.fileId) {
  //       // this.postTiles[i].color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
  //     }
  //   }
  // }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }


}
