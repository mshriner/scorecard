import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  public readonly CAN_SHARE_DATA = this.canBrowserShareData('test');
  public readonly CAN_SHARE_FILES = this.canBrowserShareFiles();

  constructor() {}

  private canBrowserShareData(data: any): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    return navigator.canShare({ text: JSON.stringify(data) });
  }

  public shareData(data: any, shareFileName: string): Observable<boolean> {
    if (!this.CAN_SHARE_DATA || !this.CAN_SHARE_FILES) {
      return of(false);
    }

    try {
      const toShare = {
        title: `Exported ${shareFileName}`,
        files: [
          new File([JSON.stringify(data)], `${shareFileName}.json`, {
            type: 'application/json',
          }),
        ],
      };
      console.log(
        navigator.canShare(toShare),
        navigator.userActivation.isActive,
        navigator.userActivation.hasBeenActive,
      );
      return from(navigator.share(toShare)).pipe(
        map(() => true),
        catchError((e) => {
          // The data could not be shared.
          console.error(
            `Error: ${e}`,
            navigator.userActivation.isActive,
            navigator.userActivation.hasBeenActive,
          );
          return of(false);
        }),
      );
      // The data was shared successfully.
    } catch (e) {
      // The data could not be shared.
      console.error(`Error: ${e}`);
      return of(false);
    }
  }

  private canBrowserShareFiles(): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    // Create some test data with a file, to check if the browser supports
    // sharing it.
    const testFile = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    const data = { files: [testFile] };

    return navigator.canShare(data);
  }

  // // Retrieve the button from the DOM. The button is hidden for now.
  // const button = document.querySelector("#share");

  // if (this.CAN_SHARE_FILES) {
  //   // The browser supports sharing files. Show the button.
  //   button.style.display = "inline";

  //   // Listen for clicks on the button and share a file.
  //   button.addEventListener("click", async () => {
  //     try {
  //       // Get the file to be shared. This function should return a File
  //       // object, perhaps by creating it dynamically, or retrieving it
  //       // from IndexedDB.
  //       const file = await getTheFileToShare();

  //       await navigator.share({
  //         title: "My shared file",
  //         files: [file],
  //       });

  //       console.log("The file was successfully shared");
  //     } catch (err) {
  //       console.error(`The file could not be shared: ${err}`);
  //     }
  //   });
  // }
}
