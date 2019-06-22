import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredfileName = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  filePreview: string;
  todayDate = (new Date()).toISOString().split('T')[0];
  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(authStatus => {
      this.isLoading = false;
    });

    this.form = new FormGroup({
      fileName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      file: new FormControl(null, {
        validators: [Validators.required]
        // asyncValidators: [mimeType]
      }),
      fileAuthor: new FormControl (null, {
        validators: []
      }),
      dateUploaded: new FormControl (null, {
        validators: [Validators.required]
      }),
      fileTags: new FormControl(null, {}),
      dateLastModified: new FormControl (null, {
        validators: []
      }),
      userLastModified: new FormControl(null, {
        validators: []
      }),
      checkedOut: new FormControl(null, {
        validators: []
      })
    });
    this.form.patchValue({
      dateUploaded: this.todayDate,
      dateLastModified: this.todayDate
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            fileName: postData.fileName,
            filePath: postData.filePath,
            fileAuthor: postData.fileAuthor,
            dateUploaded: postData.dateUploaded,
            fileTags: postData.fileTags,
            dateLastModified: postData.dateLastModified,
            userLastModified: postData.userLastModified,
            checkedOut: postData.checkedOut
          };
          this.form.patchValue({
            fileName: this.post.fileName,
            file: this.post.filePath,
            fileAuthor: this.post.fileAuthor,
            dateUploaded: this.post.dateUploaded,
            fileTags: this.post.fileTags,
            dateLastModified: this.post.dateLastModified,
            userLastModified: this.post.userLastModified,
            checkedOut: this.post.checkedOut
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onFilePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ file: file });
    this.form.get('file').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.filePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.fileName,
        this.form.value.file,
        this.form.value.fileAuthor,
        this.form.value.dateUploaded,
        this.form.value.fileTags,
        this.form.value.dateLastModified,
        this.form.value.userLastModified,
        false
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.fileName,
        this.form.value.file,
        this.form.value.fileAuthor,
        this.form.value.dateUploaded,
        this.form.value.fileTags,
        this.form.value.dateLastModified,
        this.form.value.userLastModified,
        false
      );
    }
    this.form.reset();
  }

  onCancel() {
    this.postsService.cancelCreate();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
