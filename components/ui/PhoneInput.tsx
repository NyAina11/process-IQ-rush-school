import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { AlertCircle, ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;     // ISO 3166-1 alpha-2
  name: string;
  dial: string;     // e.g. "+33"
  flag: string;     // emoji flag
  format: string;   // e.g. "XX XX XX XX XX" where X = digit
}

const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', format: 'X XX XX XX XX' },
  { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫', format: 'XXX XXX XXXX' },
  { code: 'ZA', name: 'Afrique du Sud', dial: '+27', flag: '🇿🇦', format: 'XX XXX XXXX' },
  { code: 'AL', name: 'Albanie', dial: '+355', flag: '🇦🇱', format: 'XXX XXX XXX' },
  { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿', format: 'XXX XX XX XX' },
  { code: 'DE', name: 'Allemagne', dial: '+49', flag: '🇩🇪', format: 'XXXX XXXXXXX' },
  { code: 'AD', name: 'Andorre', dial: '+376', flag: '🇦🇩', format: 'XXX XXX' },
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴', format: 'XXX XXX XXX' },
  { code: 'SA', name: 'Arabie saoudite', dial: '+966', flag: '🇸🇦', format: 'XX XXX XXXX' },
  { code: 'AR', name: 'Argentine', dial: '+54', flag: '🇦🇷', format: 'XX XXXX XXXX' },
  { code: 'AM', name: 'Arménie', dial: '+374', flag: '🇦🇲', format: 'XX XXX XXX' },
  { code: 'AU', name: 'Australie', dial: '+61', flag: '🇦🇺', format: 'XXX XXX XXX' },
  { code: 'AT', name: 'Autriche', dial: '+43', flag: '🇦🇹', format: 'XXXX XXXXXX' },
  { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪', format: 'XXX XX XX XX' },
  { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯', format: 'XX XX XX XX' },
  { code: 'BR', name: 'Brésil', dial: '+55', flag: '🇧🇷', format: 'XX XXXXX XXXX' },
  { code: 'BG', name: 'Bulgarie', dial: '+359', flag: '🇧🇬', format: 'XX XXX XXXX' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫', format: 'XX XX XX XX' },
  { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮', format: 'XX XX XX XX' },
  { code: 'KH', name: 'Cambodge', dial: '+855', flag: '🇰🇭', format: 'XX XXX XXX' },
  { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲', format: 'X XX XX XX XX' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', format: 'XXX XXX XXXX' },
  { code: 'CF', name: 'Centrafrique', dial: '+236', flag: '🇨🇫', format: 'XX XX XX XX' },
  { code: 'CL', name: 'Chili', dial: '+56', flag: '🇨🇱', format: 'X XXXX XXXX' },
  { code: 'CN', name: 'Chine', dial: '+86', flag: '🇨🇳', format: 'XXX XXXX XXXX' },
  { code: 'CY', name: 'Chypre', dial: '+357', flag: '🇨🇾', format: 'XX XXXXXX' },
  { code: 'CO', name: 'Colombie', dial: '+57', flag: '🇨🇴', format: 'XXX XXX XXXX' },
  { code: 'KM', name: 'Comores', dial: '+269', flag: '🇰🇲', format: 'XXX XX XX' },
  { code: 'CG', name: 'Congo', dial: '+242', flag: '🇨🇬', format: 'XX XXX XXXX' },
  { code: 'CD', name: 'Congo (RDC)', dial: '+243', flag: '🇨🇩', format: 'XXX XXX XXX' },
  { code: 'KR', name: 'Corée du Sud', dial: '+82', flag: '🇰🇷', format: 'XX XXXX XXXX' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮', format: 'XX XX XX XX XX' },
  { code: 'HR', name: 'Croatie', dial: '+385', flag: '🇭🇷', format: 'XX XXX XXXX' },
  { code: 'CU', name: 'Cuba', dial: '+53', flag: '🇨🇺', format: 'X XXX XXXX' },
  { code: 'DK', name: 'Danemark', dial: '+45', flag: '🇩🇰', format: 'XX XX XX XX' },
  { code: 'DJ', name: 'Djibouti', dial: '+253', flag: '🇩🇯', format: 'XX XX XX XX' },
  { code: 'EG', name: 'Égypte', dial: '+20', flag: '🇪🇬', format: 'XX XXXX XXXX' },
  { code: 'AE', name: 'Émirats arabes unis', dial: '+971', flag: '🇦🇪', format: 'XX XXX XXXX' },
  { code: 'EC', name: 'Équateur', dial: '+593', flag: '🇪🇨', format: 'XX XXX XXXX' },
  { code: 'ES', name: 'Espagne', dial: '+34', flag: '🇪🇸', format: 'XXX XXX XXX' },
  { code: 'EE', name: 'Estonie', dial: '+372', flag: '🇪🇪', format: 'XXXX XXXX' },
  { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸', format: 'XXX XXX XXXX' },
  { code: 'ET', name: 'Éthiopie', dial: '+251', flag: '🇪🇹', format: 'XX XXX XXXX' },
  { code: 'FI', name: 'Finlande', dial: '+358', flag: '🇫🇮', format: 'XX XXX XXXX' },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦', format: 'X XX XX XX' },
  { code: 'GE', name: 'Géorgie', dial: '+995', flag: '🇬🇪', format: 'XXX XX XX XX' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', format: 'XX XXX XXXX' },
  { code: 'GR', name: 'Grèce', dial: '+30', flag: '🇬🇷', format: 'XXX XXX XXXX' },
  { code: 'GP', name: 'Guadeloupe', dial: '+590', flag: '🇬🇵', format: 'XXX XX XX XX' },
  { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳', format: 'XXX XX XX XX' },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '+240', flag: '🇬🇶', format: 'XXX XXX XXX' },
  { code: 'GF', name: 'Guyane française', dial: '+594', flag: '🇬🇫', format: 'XXX XX XX XX' },
  { code: 'HT', name: 'Haïti', dial: '+509', flag: '🇭🇹', format: 'XX XX XXXX' },
  { code: 'HU', name: 'Hongrie', dial: '+36', flag: '🇭🇺', format: 'XX XXX XXXX' },
  { code: 'IN', name: 'Inde', dial: '+91', flag: '🇮🇳', format: 'XXXXX XXXXX' },
  { code: 'ID', name: 'Indonésie', dial: '+62', flag: '🇮🇩', format: 'XXX XXXX XXXX' },
  { code: 'IQ', name: 'Irak', dial: '+964', flag: '🇮🇶', format: 'XXX XXX XXXX' },
  { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷', format: 'XXX XXX XXXX' },
  { code: 'IE', name: 'Irlande', dial: '+353', flag: '🇮🇪', format: 'XX XXX XXXX' },
  { code: 'IS', name: 'Islande', dial: '+354', flag: '🇮🇸', format: 'XXX XXXX' },
  { code: 'IL', name: 'Israël', dial: '+972', flag: '🇮🇱', format: 'XX XXX XXXX' },
  { code: 'IT', name: 'Italie', dial: '+39', flag: '🇮🇹', format: 'XXX XXX XXXX' },
  { code: 'JP', name: 'Japon', dial: '+81', flag: '🇯🇵', format: 'XX XXXX XXXX' },
  { code: 'JO', name: 'Jordanie', dial: '+962', flag: '🇯🇴', format: 'X XXXX XXXX' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', format: 'XXX XXX XXX' },
  { code: 'LB', name: 'Liban', dial: '+961', flag: '🇱🇧', format: 'XX XXX XXX' },
  { code: 'LY', name: 'Libye', dial: '+218', flag: '🇱🇾', format: 'XX XXX XXXX' },
  { code: 'LU', name: 'Luxembourg', dial: '+352', flag: '🇱🇺', format: 'XXX XXX XXX' },
  { code: 'MG', name: 'Madagascar', dial: '+261', flag: '🇲🇬', format: 'XX XX XXX XX' },
  { code: 'MY', name: 'Malaisie', dial: '+60', flag: '🇲🇾', format: 'XX XXXX XXXX' },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱', format: 'XX XX XX XX' },
  { code: 'MT', name: 'Malte', dial: '+356', flag: '🇲🇹', format: 'XXXX XXXX' },
  { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦', format: 'XXX XX XX XX' },
  { code: 'MQ', name: 'Martinique', dial: '+596', flag: '🇲🇶', format: 'XXX XX XX XX' },
  { code: 'MR', name: 'Mauritanie', dial: '+222', flag: '🇲🇷', format: 'XX XX XX XX' },
  { code: 'MU', name: 'Maurice', dial: '+230', flag: '🇲🇺', format: 'XXXX XXXX' },
  { code: 'YT', name: 'Mayotte', dial: '+262', flag: '🇾🇹', format: 'XXX XX XX XX' },
  { code: 'MX', name: 'Mexique', dial: '+52', flag: '🇲🇽', format: 'XX XXXX XXXX' },
  { code: 'MC', name: 'Monaco', dial: '+377', flag: '🇲🇨', format: 'XX XX XX XX' },
  { code: 'MN', name: 'Mongolie', dial: '+976', flag: '🇲🇳', format: 'XXXX XXXX' },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿', format: 'XX XXX XXXX' },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪', format: 'XX XX XX XX' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', format: 'XXX XXX XXXX' },
  { code: 'NO', name: 'Norvège', dial: '+47', flag: '🇳🇴', format: 'XXX XX XXX' },
  { code: 'NC', name: 'Nouvelle-Calédonie', dial: '+687', flag: '🇳🇨', format: 'XX XX XX' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dial: '+64', flag: '🇳🇿', format: 'XX XXX XXXX' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', format: 'XXX XXX XXXX' },
  { code: 'NL', name: 'Pays-Bas', dial: '+31', flag: '🇳🇱', format: 'X XX XX XX XX' },
  { code: 'PE', name: 'Pérou', dial: '+51', flag: '🇵🇪', format: 'XXX XXX XXX' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', format: 'XXX XXX XXXX' },
  { code: 'PL', name: 'Pologne', dial: '+48', flag: '🇵🇱', format: 'XXX XXX XXX' },
  { code: 'PF', name: 'Polynésie française', dial: '+689', flag: '🇵🇫', format: 'XX XX XX XX' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', format: 'XXX XXX XXX' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦', format: 'XXXX XXXX' },
  { code: 'RE', name: 'La Réunion', dial: '+262', flag: '🇷🇪', format: 'XXX XX XX XX' },
  { code: 'RO', name: 'Roumanie', dial: '+40', flag: '🇷🇴', format: 'XXX XXX XXX' },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧', format: 'XXXX XXXXXX' },
  { code: 'RU', name: 'Russie', dial: '+7', flag: '🇷🇺', format: 'XXX XXX XX XX' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', format: 'XXX XXX XXX' },
  { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳', format: 'XX XXX XX XX' },
  { code: 'RS', name: 'Serbie', dial: '+381', flag: '🇷🇸', format: 'XX XXX XXXX' },
  { code: 'SG', name: 'Singapour', dial: '+65', flag: '🇸🇬', format: 'XXXX XXXX' },
  { code: 'SK', name: 'Slovaquie', dial: '+421', flag: '🇸🇰', format: 'XXX XXX XXX' },
  { code: 'SI', name: 'Slovénie', dial: '+386', flag: '🇸🇮', format: 'XX XXX XXX' },
  { code: 'SE', name: 'Suède', dial: '+46', flag: '🇸🇪', format: 'XX XXX XX XX' },
  { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭', format: 'XX XXX XX XX' },
  { code: 'TH', name: 'Thaïlande', dial: '+66', flag: '🇹🇭', format: 'XX XXX XXXX' },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬', format: 'XX XX XX XX' },
  { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳', format: 'XX XXX XXX' },
  { code: 'TR', name: 'Turquie', dial: '+90', flag: '🇹🇷', format: 'XXX XXX XXXX' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦', format: 'XX XXX XX XX' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳', format: 'XX XXX XX XX' },
];

// Get max digits from format
const getMaxDigits = (format: string) => (format.match(/X/g) || []).length;

// Format number based on country format pattern
const formatByPattern = (digits: string, pattern: string): string => {
  let result = '';
  let digitIdx = 0;
  for (let i = 0; i < pattern.length && digitIdx < digits.length; i++) {
    if (pattern[i] === 'X') {
      result += digits[digitIdx++];
    } else {
      result += pattern[i];
    }
  }
  return result;
};

interface PhoneInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (fullValue: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, required, value = '', onChange, onBlur, name, placeholder }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // France default
    const [localNumber, setLocalNumber] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Parse initial value to extract country + number
    useEffect(() => {
      if (value) {
        // Try to match a country dial code from the value
        const cleaned = value.replace(/\s/g, '');
        let matched = false;
        // Sort by dial code length desc to match longest first
        const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
        for (const c of sorted) {
          const dialClean = c.dial.replace(/\s/g, '');
          if (cleaned.startsWith(dialClean)) {
            setSelectedCountry(c);
            const rest = cleaned.slice(dialClean.length);
            setLocalNumber(rest);
            matched = true;
            break;
          }
        }
        if (!matched) {
          // Maybe it's a local number (starts with 0)
          if (cleaned.startsWith('0')) {
            setSelectedCountry(COUNTRIES[0]); // France
            setLocalNumber(cleaned);
          } else {
            setLocalNumber(cleaned);
          }
        }
      }
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch('');
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
      if (open && searchRef.current) {
        searchRef.current.focus();
      }
    }, [open]);

    const maxDigits = getMaxDigits(selectedCountry.format);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const limited = raw.slice(0, maxDigits);
      setLocalNumber(limited);

      // Build full value: dial + formatted
      const fullValue = selectedCountry.dial + ' ' + formatByPattern(limited, selectedCountry.format);
      onChange?.(fullValue.trim());
    };

    const handleSelectCountry = (country: Country) => {
      setSelectedCountry(country);
      setOpen(false);
      setSearch('');

      // Reformat with new country
      const limited = localNumber.slice(0, getMaxDigits(country.format));
      setLocalNumber(limited);
      const fullValue = country.dial + ' ' + formatByPattern(limited, country.format);
      onChange?.(fullValue.trim());
    };

    const displayNumber = formatByPattern(localNumber, selectedCountry.format);

    // Filter countries
    const filtered = useMemo(() => {
      if (!search) return COUNTRIES;
      const q = search.toLowerCase();
      return COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
      );
    }, [search]);

    // Group by first letter
    const letters = useMemo(() => {
      const set = new Set(filtered.map((c) => c.name[0].toUpperCase()));
      return Array.from(set).sort();
    }, [filtered]);

    // Keyboard letter jump
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) && !search) {
        // Already handled by search input
      }
    };

    const scrollToLetter = (letter: string) => {
      if (!listRef.current) return;
      const el = listRef.current.querySelector(`[data-letter="${letter}"]`);
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex" ref={dropdownRef}>
          {/* Country selector */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1 px-2.5 py-3 bg-[#fafafa] border rounded-l-[4px] text-[13px] hover:bg-[#f0ecfa] transition-colors shrink-0 ${
              error ? 'border-rose-300' : 'border-slate-200 border-r-0'
            }`}
          >
            <span className="text-[18px] leading-none">{selectedCountry.flag}</span>
            <span className="text-[12px] font-semibold text-slate-600 min-w-[38px]">{selectedCountry.dial}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {/* Phone number input */}
          <input
            ref={ref}
            type="tel"
            name={name}
            value={displayNumber}
            onChange={handleNumberChange}
            onBlur={onBlur}
            placeholder={placeholder || selectedCountry.format.replace(/X/g, '0')}
            className={`w-full px-3 py-3 bg-white border rounded-r-[4px] text-base text-slate-800 placeholder:text-slate-400 transition-all focus:ring-4 focus:outline-none ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
            }`}
          />

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-[#e5e0f5] rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-[#f3f0ff]">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#fafafa] border border-[#e5e0f5] rounded-lg">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Rechercher un pays..."
                    className="bg-transparent text-[13px] outline-none w-full placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Letter nav */}
              {!search && (
                <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-[#f3f0ff] bg-[#faf8ff]">
                  {letters.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => scrollToLetter(l)}
                      className="w-6 h-6 rounded text-[10px] font-bold text-slate-500 hover:bg-[#6d28d9] hover:text-white transition-colors flex items-center justify-center"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}

              {/* Country list */}
              <div ref={listRef} className="max-h-[280px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="py-6 text-center text-[13px] text-slate-400">Aucun pays trouvé</div>
                ) : (
                  filtered.map((country, i) => {
                    const isFirst = i === 0 || country.name[0] !== filtered[i - 1].name[0];
                    return (
                      <React.Fragment key={country.code}>
                        {isFirst && (
                          <div
                            data-letter={country.name[0].toUpperCase()}
                            className="px-3 py-1 bg-[#faf8ff] text-[10px] font-bold text-[#6d28d9] uppercase tracking-wider sticky top-0"
                          >
                            {country.name[0].toUpperCase()}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSelectCountry(country)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f5f3ff] transition-colors ${
                            selectedCountry.code === country.code ? 'bg-[#f5f3ff]' : ''
                          }`}
                        >
                          <span className="text-[18px] leading-none">{country.flag}</span>
                          <span className="flex-1 text-[13px] font-medium text-slate-700 truncate">{country.name}</span>
                          <span className="text-[12px] font-semibold text-slate-400">{country.dial}</span>
                        </button>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 ml-1 text-rose-500 text-xs font-bold animate-slide-in">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
export { COUNTRIES };
export type { Country };
