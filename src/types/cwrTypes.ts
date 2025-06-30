export interface CWRTemplateField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'array' | 'nested';
  width?: number;
  style?: object;
}

export interface CWRTemplate {
  id: string;
  name: string;
  description: string;
  fields: CWRTemplateField[];
}
