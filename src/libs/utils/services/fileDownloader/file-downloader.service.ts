import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { saveAs } from "file-saver";

@Injectable({
  providedIn: "root",
})
export class FileDownloaderService {
  http = inject(HttpClient);

  downloadFileFromUrl(url: string, fileName: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const file = new Blob([blob], { type: blob.type });
        saveAs(file, decodeURI(fileName));
      });
  }

  previewFileFromUrl(url: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      });
  }
}
