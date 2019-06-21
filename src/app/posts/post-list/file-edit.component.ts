import { Component, Inject, OnInit } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from './post-list.component';
import { windowWhen } from 'rxjs/operators';

@Component({
  selector: 'file-edit-component',
  templateUrl: 'file-edit.component.html',
  styleUrls: ['file-edit.component.css']
})
export class FileEditDialogComponent implements OnInit {

  public fileId: string;
  public fileDelete = true;
  public downloadFilePath: string;
  public fileName: string;

  constructor(
    public dialogRef: MatDialogRef<FileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit() {
      this.fileId = this.data.fileId;
      this.downloadFilePath = this.data.filePath;
      console.log(this.downloadFilePath);
      console.log(this.data);
    }

  onCancelClick() {
    this.dialogRef.close();
  }

  onEditClick(fileId) {
    this.dialogRef.close();
  }

  onCheckoutClick(filePath) {
    window.location.href = filePath;

    // var anchor = document.createElement('a');
    // anchor.href = this.data.filePath;
    // anchor.target = '_blank';
    // anchor.download = this.data.fileName;
    // anchor.click();
  }

}
