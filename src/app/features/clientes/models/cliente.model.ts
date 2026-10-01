export interface Cliente{id:number;dni:string;nombres:string;apellidos:string;email:string;telefono:string;direccion:string;estado:boolean;fechaCreacion?:string;fechaModificacion?:string}
export type ClienteRequest=Omit<Cliente,'id'|'fechaCreacion'|'fechaModificacion'>;
