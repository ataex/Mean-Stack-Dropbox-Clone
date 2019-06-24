import { Component, Inject, OnInit, OnDestroy } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from './post-list.component';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'file-edit-component',
  templateUrl: 'file-edit.component.html',
  styleUrls: ['file-edit.component.css']
})
export class FileEditDialogComponent implements OnInit, OnDestroy {

  public fileId: string;
  public fileDelete = true;
  public fileCheckedOut = 'checkOut';
  public fileCheckIn = 'checkIn';
  public downloadFilePath: string;
  public fileName: string;
  userIsAuthenticated = false;
  userId: string;
  private authStatusSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<FileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private authService: AuthService) {}

    ngOnInit() {
      this.fileId = this.data.fileId;
      this.downloadFilePath = this.data.filePath;
      this.userId = this.authService.getUserId();
      this.userIsAuthenticated = this.authService.getisAuth();
      this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
    }

  onCancelClick() {
    this.dialogRef.close();
  }

  onEditClick(fileId) {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
