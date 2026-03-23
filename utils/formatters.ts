
export const formatPhone = (value: string) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  // Limit to 10 digits for standard French mobile/landline
  const limited = digits.slice(0, 10);
  const groups = limited.match(/.{1,2}/g);
  if (groups) {
    return groups.join(' ');
  }
  return limited;
};

export const formatNIR = (value: string) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '').slice(0, 15);
  let formatted = '';
  
  if (digits.length > 0) formatted += digits.substring(0, 1);
  if (digits.length > 1) formatted += ' ' + digits.substring(1, 3);
  if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
  if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
  if (digits.length > 7) formatted += ' ' + digits.substring(7, 10);
  if (digits.length > 10) formatted += ' ' + digits.substring(10, 13);
  if (digits.length > 13) formatted += ' ' + digits.substring(13, 15);
  
  return formatted;
};

export const formatSIRET = (value: string) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '').slice(0, 14);
  let formatted = '';
  
  if (digits.length > 0) formatted += digits.substring(0, 3);
  if (digits.length > 3) formatted += ' ' + digits.substring(3, 6);
  if (digits.length > 6) formatted += ' ' + digits.substring(6, 9);
  if (digits.length > 9) formatted += ' ' + digits.substring(9, 14);
  
  return formatted;
};

export const formatFormation = (value: string) => {
  if (!value) return value;
  return value.replace(/\s*\(rentrée decalée\)/gi, '').trim();
};

export const decimalToTime = (decimal: string | number): string => {
  if (!decimal) return "35:00";
  const num = parseFloat(String(decimal).replace(',', '.'));
  if (isNaN(num)) return "35:00";
  
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const timeToDecimal = (time: string): string => {
  if (!time) return "35";
  if (!time.includes(':')) return time;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const decimal = hours + (minutes / 60);
  return parseFloat(decimal.toFixed(2)).toString();
};
