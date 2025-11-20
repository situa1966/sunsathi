import React, { useState, useRef } from 'react';
import { Plus, Minus, Trash2, Camera, Zap, Sparkles, Calculator } from 'lucide-react';
import { Appliance } from '../types';
import { DEFAULT_APPLIANCES } from '../constants';
import { detectAppliancesFromImage } from '../services/geminiService';

interface ApplianceCalculatorProps {
  onCalculate: (appliances: Appliance[]) => void;
}

const ApplianceCalculator: React.FC<ApplianceCalculatorProps> = ({ onCalculate }) => {
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
  const [isDetecting, setIsDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateQuantity = (id: string, delta: number) => {
    setAppliances(apps => apps.map(app => {
      if (app.id === id) {
        const newQty = Math.max(0, app.quantity + delta);
        return { ...app, quantity: newQty };
      }
      return app;
    }));
  };

  const updateHours = (id: string, val: string) => {
    const hours = Math.min(24, Math.max(0, Number(val)));
    setAppliances(apps => apps.map(app => 
      app.id === id ? { ...app, dailyHours: hours } : app
    ));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDetecting(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const detected = await detectAppliancesFromImage(base64Data);
        
        // Merge detected appliances
        setAppliances(prev => {
          const combined = [...prev];
          detected.forEach(dApp => {
            const existingIndex = combined.findIndex(c => c.name.toLowerCase().includes(dApp.name.toLowerCase()));
            if (existingIndex >= 0) {
              combined[existingIndex].quantity += dApp.quantity;
            } else {
              combined.push(dApp);
            }
          });
          return combined;
        });
        alert(`Detected ${detected.length} appliances!`);
      } catch (error) {
        alert("Failed to identify appliances. Please try manual input.");
      } finally {
        setIsDetecting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const handleCalculate = () => {
    onCalculate(appliances);
  };

  const activeAppliances = appliances.filter(a => a.quantity > 0).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-fade-in">
      <div className="bg-blue-50 p-6 border-b border-blue-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Energy Consumption Calculator
        </h2>
        <p className="text-gray-600 mt-1">Add your appliances to see how much you spend and how much Solar can save you.</p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* AI Upload Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              AI Quick Add
            </h3>
            <p className="text-sm text-indigo-700">Take a photo of your room/appliances to auto-add them.</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isDetecting}
              className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all shadow-sm"
            >
              {isDetecting ? (
                <span className="animate-pulse">Scanning...</span>
              ) : (
                <>
                  <Camera size={18} />
                  Scan Appliances
                </>
              )}
            </button>
          </div>
        </div>

        {/* Appliance List */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
            <div className="col-span-5 sm:col-span-4">Appliance</div>
            <div className="col-span-3 sm:col-span-2 text-center">Watts</div>
            <div className="col-span-4 sm:col-span-3 text-center">Daily Hours</div>
            <div className="col-span-12 sm:col-span-3 text-center mt-2 sm:mt-0">Quantity</div>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {appliances.map((app) => (
              <div key={app.id} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border transition-all ${app.quantity > 0 ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-transparent opacity-75'}`}>
                
                {/* Name */}
                <div className="col-span-5 sm:col-span-4 font-medium text-gray-800 truncate flex items-center gap-2">
                   {app.category === 'cooling' && <Zap size={14} className="text-blue-400" />}
                   {app.name}
                </div>

                {/* Wattage */}
                <div className="col-span-3 sm:col-span-2 text-center text-sm text-gray-500">
                  {app.wattage}W
                </div>

                {/* Hours Input */}
                <div className="col-span-4 sm:col-span-3 flex justify-center">
                  <input 
                    type="number" 
                    value={app.dailyHours}
                    onChange={(e) => updateHours(app.id, e.target.value)}
                    className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Quantity Controls */}
                <div className="col-span-12 sm:col-span-3 flex items-center justify-center gap-3 mt-2 sm:mt-0">
                  <button onClick={() => updateQuantity(app.id, -1)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                    <Minus size={16} />
                  </button>
                  <span className={`font-bold w-6 text-center ${app.quantity > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {app.quantity}
                  </span>
                  <button onClick={() => updateQuantity(app.id, 1)} className="p-1 rounded-full hover:bg-blue-100 text-blue-600">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={activeAppliances === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
            activeAppliances === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/30'
          }`}
        >
          Calculate Potential Savings
        </button>
      </div>
    </div>
  );
};

export default ApplianceCalculator;