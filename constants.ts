import { IndianRegion, Appliance } from "./types";

export const REGION_SUN_HOURS: Record<IndianRegion, number> = {
  [IndianRegion.NORTH]: 5.25,
  [IndianRegion.WEST]: 5.75,
  [IndianRegion.SOUTH]: 5.25,
  [IndianRegion.EAST]: 4.75,
  [IndianRegion.NORTH_EAST]: 4.0,
  [IndianRegion.CENTRAL]: 5.5,
  [IndianRegion.OTHER]: 5.0,
};

// Estimated installation cost per kW before subsidy (Market average)
export const COST_PER_KW_INR = 50000; 
export const TARIFF_PER_UNIT = 8;

export const PM_SURYA_GHAR_RULES = `
  - For systems up to 2 kW: ₹30,000 subsidy per kW.
  - For systems above 2 kW, up to 3 kW: ₹18,000 per kW (for the additional kW).
  - For systems above 3 kW: ₹78,000 total subsidy fixed.
`;

export const DEFAULT_APPLIANCES: Appliance[] = [
  { id: '1', name: 'Ceiling Fan', wattage: 75, quantity: 2, dailyHours: 10, category: 'cooling' },
  { id: '2', name: 'LED Bulb', wattage: 9, quantity: 5, dailyHours: 6, category: 'lighting' },
  { id: '3', name: 'AC (1.5 Ton)', wattage: 1500, quantity: 0, dailyHours: 8, category: 'cooling' },
  { id: '4', name: 'Refrigerator', wattage: 200, quantity: 1, dailyHours: 24, category: 'kitchen' }, // Compressor cycles included in wattage avg or handle logic later
  { id: '5', name: 'Television (LED)', wattage: 100, quantity: 1, dailyHours: 4, category: 'entertainment' },
  { id: '6', name: 'Washing Machine', wattage: 500, quantity: 0, dailyHours: 1, category: 'other' },
  { id: '7', name: 'Geyser (Water Heater)', wattage: 2000, quantity: 0, dailyHours: 1, category: 'heating' },
];