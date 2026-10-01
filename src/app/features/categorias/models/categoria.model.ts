export interface Categoria{id:number;nombre:string;descripcion:string;estado:boolean;fechaCreacion?:string;fechaModificacion?:string}
export type CategoriaRequest=Omit<Categoria,'id'|'fechaCreacion'|'fechaModificacion'>;
