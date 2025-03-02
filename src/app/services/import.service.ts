import { Injectable } from '@angular/core';
import { Course } from '../models/course';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  constructor() {
    // this.chooseAFile();
  }

  public chooseAFile(): any {
    if (!('showOpenFilePicker' in window)) {
      alert(
        'Your current device does not support the File System API. Try again on desktop Chrome!',
      );
    } else {
      alert('can launch!');
    }
    // else {
    //   //here you specify the type of files you want to allow
    //   let options = {
    //     types: [{
    //       description: "Images",
    //       accept: {
    //           "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    //           "text/*": [".txt", ".json"],
    //           "application/*": [".json"],
    //       },
    //     }],
    //     excludeAcceptAllOption: true,
    //     multiple: false,
    //   };

    //   // Open file picker and choose a file
    //   let fileHandle = await window.showOpenFilePicker(options);
    //   if (!fileHandle[0]){return;}

    //   // get the content of the file
    //   let file = await fileHandle[0].getFile();
    //   previewFile(file);
    // }
  }
}
