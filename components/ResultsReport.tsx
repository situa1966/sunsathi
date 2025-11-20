import React from 'react';
import { SolarAnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, IndianRupee, Sun, Zap, Award } from 'lucide-react';

interface ResultsReportProps {
  data: SolarAnalysisResult;
}

const ResultsReport: React.FC<ResultsReportProps> = ({ data }) => {
  // Data for the chart
  const chartData = [
    { name: 'Year 1', savings: data.yearlySavingsInr },
    { name: 'Year 5', savings: data.yearlySavingsInr * 5 },
    { name: 'Year 10', savings: data.yearlySavingsInr * 10 },
    { name: 'Year 25', savings: data.yearlySavingsInr * 25 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (data.usableRoofAreaSqM === 0) {
    return (
       <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-3xl mx-auto animate-fade-in">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Could Not Analyze Roof</h3>
          <p className="text-gray-600">{data.reasoning}</p>
          <p className="mt-4 text-sm text-gray-500">Please try uploading a clearer image with a view of the roof surface.</p>
       </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-2xl border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-400 rounded-lg text-white shadow-sm">
              <Sun size={20} />
            </div>
            <h3 className="font-semibold text-yellow-900">System Potential</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.systemCapacityKw.toFixed(2)} <span className="text-lg text-gray-600">kW</span></p>
          <p className="text-sm text-gray-600 mt-1">{data.numberOfPanels} Panels (~{Math.round(data.usableRoofAreaSqM)} m² area)</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500 rounded-lg text-white shadow-sm">
              <IndianRupee size={20} />
            </div>
            <h3 className="font-semibold text-green-900">Monthly Savings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.monthlySavingsInr)}</p>
          <p className="text-sm text-gray-600 mt-1">~{data.monthlyGenerationKwh.toFixed(0)} kWh generated/mo</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Award size={100} className="text-blue-800" />
          </div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-500 rounded-lg text-white shadow-sm">
              <Award size={20} />
            </div>
            <h3 className="font-semibold text-blue-900">Estimated Subsidy</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">{formatCurrency(data.estimatedSubsidyInr)}</p>
          <p className="text-sm text-gray-600 mt-1">PM Surya Ghar Yojana</p>
        </div>
      </div>

      {/* Main Analysis & ROI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Text Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="text-orange-500" size={20} />
            Analysis Summary
          </h3>
          
          <div className="prose prose-sm text-gray-600 mb-6">
            <p>{data.reasoning}</p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">Est. Installation Cost</span>
              <span className="font-semibold text-gray-900">~{formatCurrency(data.estimatedNetCostInr + data.estimatedSubsidyInr)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 text-green-600">
              <span>Subsidy Deduction</span>
              <span className="font-bold">-{formatCurrency(data.estimatedSubsidyInr)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-800 font-medium">Effective Net Cost</span>
              <span className="font-bold text-xl text-gray-900">{formatCurrency(data.estimatedNetCostInr)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />
            <p>ROI Estimate: Your system pays for itself in approximately <strong>{data.roiYears.toFixed(1)} years</strong>.</p>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Cumulative Savings Projection</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Cumulative Savings"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="savings" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">*Projections assuming constant tariff rates and generation efficiency.</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsReport;
