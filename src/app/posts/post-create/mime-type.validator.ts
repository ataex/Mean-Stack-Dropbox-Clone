//get rid of mime type as any file uploaded

import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
        let header = '';
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
          case 'D0CF11E0A1B11AE1':
          case 'application/msword':
          case 'application/msword':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
          case 'application/vnd.ms-word.document.macroEnabled.12':
          case 'application/vnd.ms-word.template.macroEnabled.12':
          case 'application/vnd.ms-excel':
          case 'application/vnd.ms-excel':
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
          case 'application/vnd.ms-excel.sheet.macroEnabled.12':
          case 'application/vnd.ms-excel.template.macroEnabled.12':
          case 'application/vnd.ms-excel.addin.macroEnabled.12':
          case 'application/vnd.ms-excel.sheet.binary.macroEnabled.12':
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          case 'application/vnd.openxmlformats-officedocument.presentationml.template':
          case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
          case 'application/vnd.ms-powerpoint.addin.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.template.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12':
          case 'application/vnd.ms-access':
          case 'doc':
          case 'dot':
          case 'docx':
          case 'dotx':
          case 'docm':
          case 'dotm':
          case 'xls':
          case 'xlt':
          case 'xla':
          case 'xlsx':
          case 'xltx':
          case 'xlsm':
          case 'xltm':
          case 'xlam':
          case 'xlsb':
          case 'ppt':
          case 'pot':
          case 'pps':
          case 'ppa':
          case 'pptx':
          case 'potx':
          case 'ppsx':
          case 'ppam':
          case 'pptm':
          case 'potm':
          case 'ppsm':
          case 'mdb':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};
