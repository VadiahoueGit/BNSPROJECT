
import * as Swal from "sweetalert2";

export async function ALERT(_icon: "success" | "error" | "warning" | "info" | "question",_title:string,_text:string){
   return await Swal.default.fire({
        icon: _icon,
        title: _title,
        text: _text,
        showConfirmButton: true,
        confirmButtonText: "J'ai compris",
        confirmButtonColor:'var(--ion-color-primary)',
        heightAuto:false,
        didDestroy: () => {
            return new Promise((resolve) => {
               
                resolve(null);
            });
        }
      })
}
export async function ALERT_QUESTION(_icon:'warning',_title:string,_text:string){
    return await Swal.default.fire({
         icon: _icon,
         title: _title,
         text: _text,
         showConfirmButton: true,
         confirmButtonText: "Oui",
         confirmButtonColor:'var(--primary-color)',
         showDenyButton:true,
         denyButtonText:"Non",
         denyButtonColor:'black',
         heightAuto:false,
         didDestroy: () => {
             return new Promise((resolve) => {
                
                 resolve(null);
             });
         }
       })
 }

export async function TOAST(_Message:string, _Color:string, _Duration = 2500) {
    // const toast = await new ToastController().create({
    //     message: _Message,
    //     duration: _Duration,
    //     keyboardClose: true,
    //     color: _Color
    // });

    // return await toast;
}