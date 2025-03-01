


// Required field validation
export const validateRequired = (value) => {
    if (!value || value.trim() === "") {
       return "Dit veld is verplicht";
    }
    return "";
 };
 
 // Email validation
 export const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
       return "Voer een geldig e-mailadres in";
    }
    return "";
 };
 
 // Minimum length validation
 export const validateMinLength = (value, minLength = 6) => {
    if (value.length < minLength) {
       return `Moet ten minste ${minLength} tekens lang zijn`;
    }
    return "";
 };
 
 // Combineer alle validaties voor gebruik
 export const validateForm = (value, rules = []) => {
    for (const rule of rules) {
       const errorMessage = rule(value);
       if (errorMessage) {
          return errorMessage;
       }
    }
    return "";
 };
 
 // Positive number validation
 export const validatePositiveNumber = (value) => {
    if (isNaN(value) || parseFloat(value) <= 0) {
       return "Voer een positief getal in";
    }
    return "";
 };
 
 // Functie om te controleren of tijdslots overlappen
 export const validateTimeOverlap = (slots, index, start, end) => {
     // Vergelijk het nieuwe slot (start, end) met alle bestaande slots
     for (let i = 0; i < slots.length; i++) {
        if (i !== index) {  // Zorg ervoor dat we niet het slot zelf vergelijken
           const otherSlot = slots[i];
           
           // Controleer of de tijden overlappen
           if (
              (start >= otherSlot.start && start < otherSlot.end) || // Start is binnen een ander slot
              (end > otherSlot.start && end <= otherSlot.end) ||    // Eindtijd valt binnen een ander slot
              (start <= otherSlot.start && end >= otherSlot.end)     // Het nieuwe slot bevat een ander slot
           ) {
              return "Tijdslots mogen niet overlappen"; // Foutmelding bij overlap
           }
        }
     }
     return ""; // Geen overlap, dus geen foutmelding
  };
  
  export function validateSubdomain(value) {
     const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/; // Allows lowercase letters, numbers, and hyphens (not starting or ending with a hyphen)
 
     if (!value) {
         return "Subdomein is verplicht.";
     }
 
     if (value.length < 3 || value.length > 63) {
         return "Subdomein moet tussen 3 en 63 tekens lang zijn.";
     }
 
     if (!subdomainRegex.test(value)) {
         return "Subdomein mag alleen kleine letters, cijfers en koppeltekens bevatten (geen begin- of eind-koppeltekens).";
     }
 
     return null; // Geen validatiefout
 }
 