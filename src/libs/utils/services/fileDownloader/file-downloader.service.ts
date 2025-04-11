import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FileSaverService } from "ngx-filesaver";

@Injectable({
  providedIn: "root",
})
export class FileDownloaderService {
  http = inject(HttpClient);
  fileSaverService = inject(FileSaverService);

  downloadFileFromUrl(url: string, fileName?: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((res) => {
        this.fileSaverService.save(res, fileName);
      });
  }

  previewFileFromUrl(url: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((res) => {
        const url = URL.createObjectURL(res);
        window.open(url, "_blank");
      });
  }
}
