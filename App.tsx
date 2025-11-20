import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultsReport from './components/ResultsReport';
import ApplianceCalculator from './components/ApplianceCalculator';
import ConsumptionReport from './components/ConsumptionReport';
import { analyzeSolarPotential } from './services/geminiService';
import { IndianRegion, SolarAnalysisResult, Appliance, ConsumptionAnalysis } from './types';
import { AlertTriangle, Sun, Calculator } from 'lucide-react';
import { TARIFF_PER_UNIT } from './constants';

type Tab = 'solar-check' | 'money-saver';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('solar-check');
  
  // State for Solar Checker
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SolarAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for Money Saver
  const [consumptionAnalysis, setConsumptionAnalysis] = useState<ConsumptionAnalysis | null>(null);

  const handleAnalyze = async (base64Image: string, region: IndianRegion) => {
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const analysisData = await analyzeSolarPotential(base64Image, region);
      setResults(analysisData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while analyzing.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCalculateConsumption = (appliances: Appliance[]) => {
    let totalDailyWh = 0;
    const breakdown: { name: string; monthlyCost: number; percentage: number }[] = [];

    appliances.forEach(app => {
        if(app.quantity > 0) {
            const dailyWh = app.wattage * app.quantity * app.dailyHours;
            totalDailyWh += dailyWh;
            breakdown.push({
                name: app.name,
                monthlyCost: (dailyWh * 30 / 1000) * TARIFF_PER_UNIT,
                percentage: 0 // calc later
            });
        }
    });

    const totalDailyKwh = totalDailyWh / 1000;
    const totalMonthlyKwh = totalDailyKwh * 30;
    const currentMonthlyBill = totalMonthlyKwh * TARIFF_PER_UNIT;
    
    // Calculate percentages
    breakdown.forEach(b => b.percentage = (b.monthlyCost / currentMonthlyBill) * 100);

    // Simple Solar logic: Assume 1kW generates ~4 units/day.
    // Target Size = Daily Load / 4.
    const recommendedSystemSizeKw = Math.ceil((totalDailyKwh / 4) * 2) / 2; // Round to nearest 0.5
    
    // Assuming net metering, bill becomes almost 0 (fixed charges excluded for simplicity)
    const projectedSolarBill = 0; 
    const monthlySavings = currentMonthlyBill - projectedSolarBill;

    setConsumptionAnalysis({
        totalMonthlyKwh,
        currentMonthlyBill,
        projectedSolarBill,
        monthlySavings,
        recommendedSystemSizeKw,
        breakdown
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Hero & Navigation */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {activeTab === 'solar-check' ? (
                    <>Check Your Roof's <span className="text-orange-600">Solar Potential</span></>
                ) : (
                    <>Calculate Your <span className="text-blue-600">Savings</span></>
                )}
            </h2>
            <p className="text-gray-600 text-lg">
                {activeTab === 'solar-check' 
                    ? "Upload a roof photo to estimate generation, costs, and subsidy eligibility."
                    : "Input your appliances to visualize energy consumption and how much you can save."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button
                onClick={() => setActiveTab('solar-check')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'solar-check' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <Sun size={18} />
                Roof Check
            </button>
            <button
                onClick={() => setActiveTab('money-saver')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'money-saver' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <Calculator size={18} />
                Money Saver
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
            {activeTab === 'solar-check' && (
                <div className="space-y-12 animate-fade-in">
                    <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    
                    {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 animate-pulse">
                        <AlertTriangle className="flex-shrink-0 mt-0.5" />
                        <div>
                        <p className="font-bold">Analysis Failed</p>
                        <p className="text-sm">{error}</p>
                        </div>
                    </div>
                    )}

                    {results && <ResultsReport data={results} />}
                </div>
            )}

            {activeTab === 'money-saver' && (
                <div className="space-y-12 animate-fade-in">
                    {!consumptionAnalysis ? (
                        <ApplianceCalculator onCalculate={handleCalculateConsumption} />
                    ) : (
                        <ConsumptionReport 
                            analysis={consumptionAnalysis} 
                            onReset={() => setConsumptionAnalysis(null)} 
                        />
                    )}
                </div>
            )}
        </div>

      </main>

      <footer className="mt-20 border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="mb-2">
            <strong>Disclaimer:</strong> "Sun-Sathi" provides AI-generated estimates based on visual data. 
            Actual generation, costs, and subsidy eligibility must be verified by a certified solar installer and DISCOM.
          </p>
          <p>© {new Date().getFullYear()} Sun-Sathi Solar Analyzer. Made for a Greener India.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;