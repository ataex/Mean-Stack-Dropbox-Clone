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
                fileName: post.fileName,
                // content: post.content,
                id: post._id,
                filePath: post.filePath,
                creator: post.author
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
    return this.http.get<{ _id: string, fileName: string, filePath: string, author: string, dateUploaded: Date, fileTags: string, dateLastModified: Date, userLastModified: string }>(
      'http://localhost:3000/api/posts/' + id
    );
  }

  addPost(
    fileName: string,
    file: File,
    author: string,
    dateUploaded: Date,
    fileTags: string,
    dateLastModified: Date,
    userLastModified: string) {
    const postData = new FormData();
    postData.append('fileName', fileName);
    postData.append('file', file, fileName);
    postData.append('author', author);
    postData.append('dateUploaded', dateUploaded.toString());
    postData.append('fileTags', fileTags);
    postData.append('dateLastModified', dateLastModified.toString());
    postData.append('userLastModified', userLastModified);
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
    author: string,
    dateUploaded: Date,
    fileTags: string,
    dateLastModified: Date,
    userLastModified: string) {
    let postData: Post | FormData;
    if (typeof file === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('fileName', fileName);
      postData.append('file', file, fileName);
      postData.append('author', author);
      postData.append('dateUploaded', dateUploaded.toString());
      postData.append('fileTags', fileTags);
      postData.append('dateLastModified', dateLastModified.toString());
      postData.append('userLastModified', userLastModified);
    } else {
      postData = {
        id: id,
        fileName: fileName,
        filePath: file,
        author: author,
        dateUploaded: dateUploaded,
        fileTags: fileTags,
        dateLastModified: dateLastModified,
        userLastModified: null
        // creator: null
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
