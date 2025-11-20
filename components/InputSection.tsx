import React, { useState, useRef } from 'react';
import { Upload, MapPin, Camera, X } from 'lucide-react';
import { IndianRegion } from '../types';

interface InputSectionProps {
  onAnalyze: (image: string, region: IndianRegion) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<IndianRegion>(IndianRegion.OTHER);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      onAnalyze(base64Data, selectedRegion);
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-orange-50 p-6 border-b border-orange-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="text-orange-500" />
          Start Your Solar Journey
        </h2>
        <p className="text-gray-600 mt-1">Upload a clear photo of your roof to get an instant estimate.</p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Region Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin size={18} className="text-gray-400" />
            Select Your Location
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as IndianRegion)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
          >
            {Object.values(IndianRegion).map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                previewUrl ? 'border-orange-300 bg-orange-50/50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />

          {previewUrl ? (
            <div className="relative w-full max-w-md mx-auto">
              <img 
                src={previewUrl} 
                alt="Roof Preview" 
                className="w-full h-64 object-cover rounded-lg shadow-md" 
              />
              <button
                onClick={clearImage}
                className="absolute -top-3 -right-3 bg-white text-red-500 p-1.5 rounded-full shadow-lg border hover:bg-red-50 transition-colors"
              >
                <X size={20} />
              </button>
              <p className="mt-4 text-sm text-green-600 font-medium">Image selected successfully!</p>
            </div>
          ) : (
            <div 
                className="cursor-pointer flex flex-col items-center justify-center space-y-4"
                onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-orange-100 p-4 rounded-full">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">Click to upload roof image</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isAnalyzing}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
            !selectedFile || isAnalyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Roof Structure...
            </span>
          ) : (
            'Calculate Solar Potential'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
