export class clientObject{
    nom: string = "";
    prenom: string ="";
    datenaissance:Date = new Date('1990-01-01');
    typeclient:number = 1

    constructor( nom: string,
        prenom: string,
        datenaissance:Date,
        typeclient:number){
        this.nom = nom;
        this.prenom= prenom;
        this.datenaissance= datenaissance;
        this.typeclient= typeclient
    }
}