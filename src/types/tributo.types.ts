/**
 * Tributo judicial del Vademécum (respuesta del backend).
 */
export interface ITributo {
  id: string;
  processType: string;
  searchTerms?: string;
  courtFee?: number;
  judicialTax?: number;
  judicialTaxNotes?: string;
  professionalStamp?: number;
  vicesima?: number;
  executionTax: boolean;
  year: number;
}
