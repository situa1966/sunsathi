import React from 'react';
import { ConsumptionAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { IndianRupee, Zap, CheckCircle2, TrendingDown } from 'lucide-react';

interface ConsumptionReportProps {
  analysis: ConsumptionAnalysis;
  onReset: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ConsumptionReport: React.FC<ConsumptionReportProps> = ({ analysis, onReset }) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const costComparisonData = [
    { name: 'Current Bill', amount: analysis.currentMonthlyBill, fill: '#ef4444' },
    { name: 'With Solar', amount: analysis.projectedSolarBill, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Zap size={20} className="text-orange-500" />
            <span className="text-sm font-medium uppercase tracking-wider">Monthly Load</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analysis.totalMonthlyKwh.toFixed(0)} <span className="text-lg font-normal text-gray-400">kWh</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2 text-gray-500">
            <IndianRupee size={20} className="text-red-500" />
            <span className="text-sm font-medium uppercase tracking-wider">Current Bill</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysis.currentMonthlyBill)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
           <div className="flex items-center gap-3 mb-2 text-green-100">
            <TrendingDown size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Potential Savings</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(analysis.monthlySavings)}<span className="text-base font-normal opacity-80">/mo</span></p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cost Comparison Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Cost Comparison</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-lg text-sm text-center">
            Switching to solar could eliminate <strong>~90-95%</strong> of your bill!
          </div>
        </div>

        {/* Load Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Where is your money going?</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysis.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="monthlyCost"
                >
                  {analysis.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
            <h4 className="text-2xl font-bold mb-2">Recommended Solar System</h4>
            <p className="text-indigo-200 max-w-md">
                To offset your monthly load of <strong>{analysis.totalMonthlyKwh.toFixed(0)} kWh</strong>, 
                we recommend a system size of approximately:
            </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 min-w-[150px] text-center">
            <span className="block text-4xl font-bold text-yellow-400">{analysis.recommendedSystemSizeKw} kW</span>
            <span className="text-xs text-indigo-200 uppercase tracking-wider">Capacity</span>
        </div>
      </div>

      <div className="text-center pt-4">
        <button 
            onClick={onReset}
            className="text-gray-500 hover:text-gray-800 font-medium underline transition-colors"
        >
            Recalculate / Edit Appliances
        </button>
      </div>

    </div>
  );
};

export default ConsumptionReport;