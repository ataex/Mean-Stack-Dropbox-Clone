import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from './post-list.component';

@Component({
  selector: 'file-edit-component',
  templateUrl: 'file-edit.component.html'
})
export class FileEditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<FileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
