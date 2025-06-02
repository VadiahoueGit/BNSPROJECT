import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DndDropEvent} from "ngx-drag-drop";
import {NgxFileDropEntry} from "ngx-file-drop";
import {CoreServiceService} from "../../core/core-service.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-annonce',
  templateUrl: './annonce.component.html',
  styleUrls: ['./annonce.component.scss']
})
export class AnnonceComponent {
  annonceForm: FormGroup;
  changeValue:any
  annonces: any[] = [];
  editingId: number | null = null;
  public files: NgxFileDropEntry[] = [];
  previews: string[] = []; // base64 des images
  filesToUpload: File[] = [];
  constructor(private fb: FormBuilder,private coreServices:CoreServiceService,private _spinner: NgxSpinnerService,private toastr: ToastrService,) {
    this.annonceForm = this.fb.group({
      titre: [''],
      texte: [''],
      isTexte: [true]
    });
    this.onChange();
  }

  onSubmit() {
    this._spinner.show()
    const formData = new FormData();
    formData.append("isTexte", this.annonceForm.controls['isTexte'].value);
    formData.append("titre", this.annonceForm.controls['titre'].value);
    formData.append("texte", this.annonceForm.controls['texte'].value);
    formData.append("image", this.previews[0])
    console.log(formData);

    this.coreServices.CreateAnnonce(formData).then((res: any) => {
      // if ()
      this._spinner.hide();
    })
  }

  onChange() {
     this.changeValue = this.annonceForm.get('isTexte')?.value
    if(this.changeValue == true) {
      this.previews = [];
      this.annonceForm.controls['titre'].setValidators([Validators.required]);
      this.annonceForm.controls['texte'].setValidators([Validators.required]);
      this.annonceForm.controls['titre'].enable();
      this.annonceForm.controls['texte'].enable();
    }else{
      this.annonceForm.controls['titre'].clearValidators();
      this.annonceForm.controls['texte'].clearValidators();
      this.annonceForm.controls['titre'].disable();
      this.annonceForm.controls['texte'].disable();
    }
    this.annonceForm.controls['titre'].updateValueAndValidity();
    this.annonceForm.controls['texte'].updateValueAndValidity();
  }
  editAnnonce(annonce: any) {
    this.editingId = annonce.id;
    this.annonceForm.patchValue(annonce);
  }

  deleteAnnonce(id: number) {
    this.annonces = this.annonces.filter(a => a.id !== id);
    if (this.editingId === id) {
      this.resetForm();
    }
  }

  resetForm() {
    this.annonceForm.reset({ isTexte: true });
    this.editingId = null;
  }

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    this.previews = []; // reset les previews

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.previews.push(reader.result as string);
          };
          reader.readAsDataURL(file); // ✅ base64

          this.filesToUpload.push(file);
        });
      }
    }
  }

  public fileOver(event:any){
    console.log(event);
  }

  public fileLeave(event:any){
    console.log(event);
  }
}
