
export const validateRequired = (value: string): string => {
   if (!value || value.trim() === "") {
     return "Dit veld is verplicht";
   }
   return "";
 };
 
 export const validateEmail = (value: string): string => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(value)) {
     return "Voer een geldig e-mailadres in";
   }
   return "";
 };
 

 export const validateMinLength = (value: string, minLength: number = 6): string => {
   if (value.length < minLength) {
     return `Moet ten minste ${minLength} tekens lang zijn`;
   }
   return "";
 };
 

 type ValidationRule = (value: string) => string;
 
 export const validateForm = (value: string, rules: ValidationRule[] = []): string => {
   for (const rule of rules) {
     const errorMessage = rule(value);
     if (errorMessage) {
       return errorMessage;
     }
   }
   return "";
 };
 

 export const validatePositiveNumber = (value: string | number): string => {
   const numValue = typeof value === "number" ? value : parseFloat(value);
   if (isNaN(numValue) || numValue <= 0) {
     return "Voer een positief getal in";
   }
   return "";
 };