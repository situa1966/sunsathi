export enum IndianRegion {
  NORTH = 'Northern Plains (Delhi, Punjab, UP)',
  WEST = 'Western India (Rajasthan, Gujarat, Maharashtra)',
  SOUTH = 'Southern India (Karnataka, TN, AP, Kerala)',
  EAST = 'Eastern India (Bengal, Odisha, Bihar)',
  NORTH_EAST = 'North East India',
  CENTRAL = 'Central India (MP, Chhattisgarh)',
  OTHER = 'Other / General India'
}

export interface SolarAnalysisResult {
  usableRoofAreaSqM: number;
  numberOfPanels: number;
  systemCapacityKw: number;
  dailyGenerationKwh: number;
  monthlyGenerationKwh: number;
  monthlySavingsInr: number;
  yearlySavingsInr: number;
  estimatedSubsidyInr: number;
  estimatedNetCostInr: number; // Market cost - subsidy
  roiYears: number;
  reasoning: string;
}

export interface AnalysisError {
  message: string;
}

export interface Appliance {
  id: string;
  name: string;
  wattage: number; // in Watts
  quantity: number;
  dailyHours: number;
  category: 'cooling' | 'heating' | 'lighting' | 'entertainment' | 'kitchen' | 'other';
}

export interface ConsumptionAnalysis {
  totalMonthlyKwh: number;
  currentMonthlyBill: number;
  projectedSolarBill: number; // Assuming net metering
  monthlySavings: number;
  recommendedSystemSizeKw: number;
  breakdown: { name: string; monthlyCost: number; percentage: number }[];
}

export interface InefficientAppliance {
  name: string;
  detectedCondition: 'Old/Inefficient' | 'Modern/Efficient';
  currentWattage: number;
  efficientWattage: number; // What a modern 5-star version uses
  monthlyEnergyLossKwh: number;
  monthlyMoneyLossInr: number;
  replacementRecommendation: string;
}

export interface EfficiencyResult {
  appliances: InefficientAppliance[];
  totalMonthlyLossInr: number;
  efficiencyScore: number; // 0 to 100
  analysisSummary: string;
}