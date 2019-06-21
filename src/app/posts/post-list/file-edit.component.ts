import { Component, Inject, OnInit } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from './post-list.component';

@Component({
  selector: 'file-edit-component',
  templateUrl: 'file-edit.component.html',
  styleUrls: ['file-edit.component.css']
})
export class FileEditDialogComponent implements OnInit {

  public fileId: string;
  public fileDelete = true;

  constructor(
    public dialogRef: MatDialogRef<FileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit() {
      this.fileId = this.data.fileId;
      console.log(this.data);
    }

  onCancelClick() {
    this.dialogRef.close();
  }

  onEditClick(fileId) {
    this.dialogRef.close();
  }

  onCheckoutClick(fileId) {

  }

}
