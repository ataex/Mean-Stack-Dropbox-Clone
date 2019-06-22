import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any, maxPosts: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                id: post._id,
                fileName: post.fileName,
                filePath: post.filePath,
                fileAuthor: post.fileAuthor,
                dateUploaded: post.dateUploaded,
                fileTags: post.fileTags,
                dateLastModified: post.dateLastModified,
                userLastModified: post.userLastModified,
                checkedOut: post.checkedOut
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, fileName: string, filePath: string, fileAuthor: string, dateUploaded: Date, fileTags: string, dateLastModified: Date, userLastModified: string, checkedOut: boolean }>(
      'http://localhost:3000/api/posts/' + id
    );
  }

  addPost(
    fileName: string,
    file: File,
    fileAuthor: string,
    dateUploaded: Date,
    fileTags: string,
    dateLastModified: Date,
    userLastModified: string,
    checkedOut: boolean) {
    const postData = new FormData();
    postData.append('fileName', fileName);
    postData.append('file', file, fileName);
    postData.append('fileAuthor', fileAuthor);
    postData.append('dateUploaded', dateUploaded.toString());
    postData.append('fileTags', fileTags);
    postData.append('dateLastModified', dateLastModified.toString());
    postData.append('userLastModified', userLastModified);
    postData.append('checkedOut', checkedOut.toString());
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(['/']);
      });
  }

  updatePost(
    id: string,
    fileName: string,
    file: File | string,
    fileAuthor: string,
    dateUploaded: Date,
    fileTags: string,
    dateLastModified: Date,
    userLastModified: string,
    checkedOut: boolean) {
    let postData: Post | FormData;
    if (typeof file === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('fileName', fileName);
      postData.append('file', file, fileName);
      postData.append('fileAuthor', fileAuthor);
      postData.append('dateUploaded', dateUploaded.toString());
      postData.append('fileTags', fileTags);
      postData.append('dateLastModified', dateLastModified.toString());
      postData.append('userLastModified', userLastModified);
      postData.append('checkedOut', checkedOut.toString());
    } else {
      postData = {
        id: id,
        fileName: fileName,
        filePath: file,
        fileAuthor: fileAuthor,
        dateUploaded: dateUploaded,
        fileTags: fileTags,
        dateLastModified: dateLastModified,
        userLastModified: userLastModified,
        checkedOut: checkedOut
      };
    }
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete('http://localhost:3000/api/posts/' + postId);
  }

  cancelCreate() {
    this.router.navigate(['/']);
  }
}
