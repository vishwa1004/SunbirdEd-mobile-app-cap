import { Injectable } from "@angular/core";
// import { Camera, CameraOptions, MediaType, PictureSourceType } from "@awesome-cordova-plugins/camera/ngx";
import {  Camera, CameraResultType, CameraSource  } from '@capacitor/camera';
import { Chooser } from '@ionic-native/chooser/ngx';

// import { Chooser } from "@awesome-cordova-plugins/chooser/ngx";
import { FileChooser } from '@ionic-native/file-chooser/ngx';
// import { FilePath } from "@awesome-cordova-plugins/file-path/ngx";
import { FilePath } from '@ionic-native/file-path/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { File } from "@awesome-cordova-plugins/file/ngx";

import { ActionSheetController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { FILE_EXTENSION_HEADERS } from "../../constants";
import { localStorageConstants } from "../../constants/localStorageConstants";
import { LoaderService } from "../loader/loader.service";
// import { ImagePicker } from '@jonz94/capacitor-image-picker';



@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  mediaType: string;
  texts: any;
  payload: any;
  actionSheetOpen: boolean = false;
  storagePath;
  constructor(
    private file: File,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private platform: Platform,
    private chooser: Chooser,
    // private filePickerIOS: IOSFilePicker,
    private translate: TranslateService,
    private loader: LoaderService,
    private filePath : FilePath

  ) {
    this.translate
      .get([
        "FRMELEMNTS_MSG_SELECT_IMAGE_SOURCE",
        "FRMELEMNTS_MSG_LOAD_FROM_LIBRARY",
        "FRMELEMNTS_MSG_USE_CAMERA",
        "FRMELEMNTS_MSG_USE_FILE",
        "CANCEL",
        "FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE",
        "FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED",
        "FRMELEMNTS_MSG_ERROR_FILE_SIZE_LIMIT",
        "FRMELEMNTS_LBL_FILE_SIZE_EXCEEDED",
        "FRMELEMENTS_LBL_CAMERA",
        "FRMELEMENTS_LBL_UPLOAD_IMAGE",
        "FRMELEMENTS_LBL_UPLOAD_FILE",
        "FRMELEMENTS_LBL_UPLOAD_VIDEO"
      ])
      .subscribe((data) => {
        this.texts = data;
      });
  }

  async selectImage(path?) {
    this.actionSheetOpen = true;
    this.storagePath = path;
    // const actionSheet = await this.actionSheetController.create({
    //   header: this.texts["FRMELEMNTS_MSG_SELECT_IMAGE_SOURCE"],
    //   cssClass: 'sb-popover',
    //   buttons: [
    //     {
    //       text: this.texts["FRMELEMNTS_MSG_LOAD_FROM_LIBRARY"],
    //       icon: "cloud-upload",
    //       handler: () => {
    //         this.takePicture(CameraSource.Photos, CameraResultType.Uri, true);
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["FRMELEMNTS_MSG_USE_CAMERA"],
    //       icon: "camera",
    //       handler: () => {
    //         this.takePicture(CameraSource.Photos);
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["FRMELEMNTS_MSG_USE_FILE"],
    //       icon: "document",
    //       handler: () => {
    //         path ? this.openLocalLibrary() : this.openFile();
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["CANCEL"],
    //       role: "cancel",
    //     },
    //   ],
    // });
    // await actionSheet.present();
    // return actionSheet.onDidDismiss();
    return {};
  }


  // Evidence upload for survey and observation
  async evidenceUpload(path?) {
    this.actionSheetOpen = true;
    this.storagePath = path;
    // const actionSheet = await this.actionSheetController.create({
    //   header: this.texts["FRMELEMNTS_MSG_SELECT_IMAGE_SOURCE"],
    //   cssClass: 'sb-popover',
    //   buttons: [
    //     {
    //       text: this.texts["FRMELEMENTS_LBL_CAMERA"],
    //       icon: "camera",
    //       handler: () => {
    //         this.takePicture(CameraSource.Camera);
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["FRMELEMENTS_LBL_UPLOAD_IMAGE"],
    //       icon: "cloud-upload",
    //       handler: () => {
    //         this.takePicture(CameraSource.Photos, CameraResultType.Uri);
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["FRMELEMENTS_LBL_UPLOAD_VIDEO"],
    //       icon: "videocam",
    //       handler: () => {
    //         this.takePicture(CameraSource.Photos, CameraResultType.Uri, true);
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["FRMELEMENTS_LBL_UPLOAD_FILE"],
    //       icon: "document",
    //       handler: () => {
    //         this.openFile();
    //         return false;
    //       },
    //     },
    //     {
    //       text: this.texts["CANCEL"],
    //       role: "cancel",
    //     },
    //   ],
    // });
    // await actionSheet.present();
    // return actionSheet.onDidDismiss();
    return null
  }
  async takePicture(source: CameraSource, resultType: CameraResultType = CameraResultType.Uri, video = false) {
    const options = {
      quality: 20,
      allowEditing: false,
      resultType: resultType,
      source: source,
      preserveAspectRatio: true
    };
    console.log(source,"source");
    // const image = source == "" await Camera.getPhoto(options);
    let photo = await Camera.getPhoto(options);
    console.log(photo,"photo");
    const image = await Camera.getPhoto(options)
    console.log(image,"image");
    console.log(this.platform.is("android"),"android");
    console.log(this.directoryPath(),"this.directoryPath()");
    if(image){
      if (this.platform.is("android")) {
              let newFilePath = image?.path;
              if (!newFilePath.includes("content://") && !newFilePath.includes("file://")) {
                newFilePath = "file://" + image?.path
              }
              await this.checkForFileSizeRestriction(newFilePath).then(isValidFile => {
                          if (isValidFile) {
                            // this.Filesystem
                            //   .resolveNativePath(newFilePath)
                            //   .then((filePath) => {
                                this.copyFile(newFilePath);
                              // })
                              // .catch(error => { })
                          }
                        })
            }
    }else{

    }
    // await this.camera
    //   .getPicture(options)
    //   .then(async(imagePath) => {
    //     if (this.platform.is("android") && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
    //       let newFilePath = imagePath;
    //       if (!newFilePath.includes("content://") && !newFilePath.includes("file://")) {
    //         newFilePath = "file://" + imagePath
    //       }
    //         await this.checkForFileSizeRestriction(newFilePath).then(isValidFile => {
    //           if (isValidFile) {
    //             this.filePath
    //               .resolveNativePath(newFilePath)
    //               .then((filePath) => {
    //                 this.copyFile(filePath);
    //               })
    //               .catch(error => { })
    //           }
    //         })
    //     } else {
    //       await this.checkForFileSizeRestriction(imagePath).then(isValidFile => {
    //         if (isValidFile) {
    //           this.copyFile(imagePath);
    //         }
    //       })
    //     }
    //   })
    //   .catch((err) => {
    //     if (err && err !== "No Image Selected") {
    //       this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
    //     }
    //   });
  }

  writeFileToPrivateFolder(filePath) {
    this.checkForFileSizeRestriction(filePath).then(isValidFile => {
      if (isValidFile) {
        this.loader.startLoader();
        let path = filePath.substr(0, filePath.lastIndexOf("/") + 1);
        let currentName = filePath.split("/").pop();
        this.file.readAsArrayBuffer(path, currentName).then(success => {
          const pathToWrite = this.directoryPath();
          const newFileName = this.createFileName(currentName)
          this.file.writeFile(pathToWrite, newFileName, success).then(async fileWrite => {
            const data = {
              name: newFileName,
              type: this.mimeType(newFileName),
              isUploaded: false,
              url: "",
            };
            await this.loader.stopLoader();
            this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
            this.actionSheetOpen ? this.actionSheetController.dismiss(data) : this.payload.push(data);
          }).catch(error => {
            this.loader.stopLoader();
            this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
          })
        }).catch(error => {
          this.loader.stopLoader();
          this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
        })
      }
    }).catch(error => { })
  }


   checkForFileSizeRestriction(filePath) {
console.log(filePath,"filePath");
    return Filesystem.readFile({ path: filePath })
    .then(fileData => {
console.log(fileData,"fileData");
      return this.getFileMetadata(filePath)
        .then(metadata => {
          console.log(metadata,"metadata")
          if (metadata.size > localStorageConstants.FILE_LIMIT) {
            this.presentToast(this.texts["FRMELEMNTS_LBL_FILE_SIZE_EXCEEDED"], 'danger', 5000);
            return false; // File size exceeded
          } else {
            console.log("261 success");
            return true;
          }
        })
        .catch(metadataError => {
          console.error('Error getting file metadata:', metadataError);
          return false; // Error getting file metadata
        });
    })
    .catch(readError => {
      console.error('Error reading file:', readError);
      return false; // Error reading file
    });
  }

  async getFileMetadata(filePath): Promise<any> {
    try {
      const readFileResult = await Filesystem.readFile({ path: filePath });
      console.log(readFileResult, "File content"); // Logging the file content
      const statResult = await Filesystem.stat({ path: filePath });
      const metadata = {
        size: statResult.size,
        // You can add more metadata properties here if needed
      };
      if (metadata.size > localStorageConstants.FILE_LIMIT) {
                  this.presentToast(this.texts["FRMELEMNTS_LBL_FILE_SIZE_EXCEEDED"],'danger', 5000);
                  return(false)
        } else  {
                  return(true)
       }
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error; // Propagate the error to the caller
    }
  }

  copyFileToLocalDir(namePath, currentName, newFileName, completeFilePath) {
    this.file.copyFile(namePath, currentName, this.directoryPath(), newFileName).then(
      (success) => {
        const data = {
          name: newFileName,
          type: this.mimeType(newFileName),
          isUploaded: false,
          url: "",
        };
        this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
        this.actionSheetOpen ? this.actionSheetController.dismiss(data) : this.payload.push(data);
      },
      (error) => {
        this.writeFileToPrivateFolder(completeFilePath);
        // this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
      }
    );
  }

  async presentToast(text, color = "danger", duration = 3000) {
    const toast = await this.toastController.create({
      message: text,
      position: "top",
      duration: duration,
      color: color,
    });
    toast.present();
  }

  async openFile(path?) {
    try {
      
      const file: any = await this.chooser.getFile('application/pdf');
      console.log(file,"file");
      let sizeOftheFile: number = file.data.length
      if (sizeOftheFile > localStorageConstants.FILE_LIMIT) {
        this.presentToast(this.texts["FRMELEMNTS_LBL_FILE_SIZE_EXCEEDED"]);
        this.actionSheetOpen ?  this.actionSheetController.dismiss() :'';
      } else {
        const pathToWrite = path ? path :this.directoryPath();
        const newFileName = this.createFileName(file.name)
        const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.data.buffer)
        if (writtenFile.isFile) {
          const data = {
            name: newFileName,
            type: this.mimeType(newFileName),
            isUploaded: false,
            url: "",
          };
          this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
          this.actionSheetOpen ? this.actionSheetController.dismiss(data) : this.payload.push(data);
        }
      }

    } catch (error) {
      console.log(error,"error")
      if(error == "OutOfMemory"){
        this.presentToast(this.texts["FRMELEMNTS_LBL_FILE_SIZE_EXCEEDED"]);
      }else{
        this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
      }
    }
  }

  copyFile(filePath) {
    let correctPath = filePath.substr(0, filePath.lastIndexOf("/") + 1);
    let currentName = filePath.split("/").pop();
    currentName = currentName.split("?")[0];
    this.copyFileToLocalDir(correctPath, currentName, this.createFileName(currentName), filePath);
  }

  createFileName(name) {
    let d = new Date(),
      n = d.getTime(),
      extentsion = name.split(".").pop(),
      newFileName = n + "." + extentsion;
    return newFileName;
  }

  directoryPath(): string {
    if(this.actionSheetOpen && this.storagePath){
      return this.storagePath;
    }else
    if (this.platform.is("ios")) {
      return this.file.documentsDirectory;
    } else {
      return this.file.externalDataDirectory;
    }
  }

  mimeType(fileName) {
    let ext = fileName.split(".").pop();
    return FILE_EXTENSION_HEADERS[ext];
  }

  deleteFile(fileName) {
    return this.file.removeFile(this.directoryPath(), fileName);
  }

  demo(){
    console.log("hi hi");
  }

  async openAttachmentSource(type, payload) {
    console.log(type,"type",payload);
    let data: any = '';
    this.actionSheetOpen = false;
    this.payload = payload;
    switch (type) {
      case 'openCamera':
        await this.takePicture(CameraSource.Camera);
        break;
      case 'openGallery':
        await this.takePicture(CameraSource.Photos,CameraResultType.Uri, true);
        break;
      case 'openImage':
        this.takePicture(CameraSource.Photos);
        break;
      case 'openVideo':
        this.takePicture(CameraSource.Prompt,CameraResultType.Uri, true);
        break;
      case 'openFiles':
        await this.openFile();
        break;
    }
  }
  async openLocalLibrary() {
    // const { images } = await ImagePicker.present({ limit: 10 });
        // this.actionSheetController.dismiss({images, multiple:true});
  }
  async openAllFile(path?) {
    // try {
    //   const file = await this.chooser.getFile();
    //   let sizeOftheFile: number = file.size
    //   if (sizeOftheFile > localStorageConstants.FILE_LIMIT) {
    //     this.actionSheetController.dismiss();
    //     this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_FILE_SIZE_LIMIT"]);
    //   } else {
    //     const pathToWrite = path ? path :this.directoryPath();
    //     const newFileName = this.createFileName(file.name)
    //     const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.path)
    //     if (writtenFile.isFile) {
    //       const data = {
    //         name: newFileName,
    //         type: this.mimeType(newFileName),
    //         isUploaded: false,
    //         url: "",
    //       };
    //       this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
    //       this.actionSheetOpen ? this.actionSheetController.dismiss(data) : this.payload.push(data);
    //     }
    //   }

    // } catch (error) {
    //   this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
    // }
  }
}