import React, { useState, useRef } from 'react';
import { Upload, Video, X, Zap, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EfficiencyResult, InefficientAppliance } from '../types';
import { analyzeVideoEfficiency } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VideoEfficiencyAudit: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EfficiencyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Please upload a short clip under 10MB.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const analysis = await analyzeVideoEfficiency(base64Data, selectedFile.type);
        setResult(analysis);
      } catch (err: any) {
        setError(err.message || "Failed to analyze video.");
      } finally {
        setIsAnalyzing(false);
      }
    };
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderComparisonChart = (appliances: InefficientAppliance[]) => {
    const data = appliances.map(app => ({
      name: app.name,
      Old: app.currentWattage,
      New: app.efficientWattage,
    })).filter(a => a.Old > a.New); // Only show relevant ones

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="Old" fill="#ef4444" name="Current Watts" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="New" fill="#22c55e" name="Efficient Watts" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-purple-50 p-6 border-b border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="text-purple-600" />
            Video Audit: Find Energy Leaks
          </h2>
          <p className="text-gray-600 mt-1">Upload a short video (max 10s) of your room. AI will identify old, inefficient appliances losing you money.</p>
        </div>

        <div className="p-8">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-xl p-10 text-center cursor-pointer hover:bg-purple-50 transition-colors"
            >
              <input ref={fileInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleFileChange} />
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800">Upload Room Video</h3>
              <p className="text-sm text-gray-500 mt-1">MP4 or WebM (Max 10MB)</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[300px] mx-auto">
                <video src={previewUrl} controls className="w-full h-full object-contain" />
                <button 
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isAnalyzing 
                  ? 'bg-purple-300 text-white cursor-wait' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Analyzing Footage...
                  </span>
                ) : 'Analyze Efficiency'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Efficiency Score</h3>
              <p className="text-gray-500 text-sm">{result.analysisSummary}</p>
            </div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke={result.efficiencyScore > 70 ? '#22c55e' : result.efficiencyScore > 40 ? '#eab308' : '#ef4444'} 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray={351} 
                  strokeDashoffset={351 - (351 * result.efficiencyScore) / 100} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{result.efficiencyScore}</span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* List of Issues */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Identified Inefficiencies
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {result.appliances.map((app, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${app.detectedCondition === 'Old/Inefficient' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-800">{app.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${app.detectedCondition === 'Old/Inefficient' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {app.detectedCondition}
                      </span>
                    </div>
                    {app.detectedCondition === 'Old/Inefficient' && (
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Wasting:</span>
                          <span className="font-bold text-red-600">{app.currentWattage - app.efficientWattage} Watts</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mb-2">
                          <span>Loss:</span>
                          <span className="font-bold text-red-600">₹{app.monthlyMoneyLossInr.toFixed(0)}/mo</span>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg text-xs text-gray-700 flex gap-2">
                          <CheckCircle2 size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          {app.replacementRecommendation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4">Wattage Comparison</h3>
               <p className="text-xs text-gray-500 mb-4">Old Equipment vs Modern Standards</p>
               {renderComparisonChart(result.appliances)}
               
               <div className="mt-6 bg-indigo-50 p-4 rounded-xl text-center">
                 <p className="text-indigo-800 text-sm">Total Potential Savings</p>
                 <p className="text-3xl font-bold text-indigo-600">₹{result.totalMonthlyLossInr.toFixed(0)}<span className="text-base font-normal">/month</span></p>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEfficiencyAudit;