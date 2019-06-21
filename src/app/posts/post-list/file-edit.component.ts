import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from './post-list.component';

@Component({
  selector: 'file-edit-dialog',
  templateUrl: 'file-edit.component.html',
})
export class FileEditDialog {

  constructor(
    public dialogRef: MatDialogRef<FileEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
