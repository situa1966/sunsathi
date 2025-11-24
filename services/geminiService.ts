import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IndianRegion, SolarAnalysisResult, Appliance, EfficiencyResult } from "../types";
import { PM_SURYA_GHAR_RULES, REGION_SUN_HOURS } from "../constants";

const MODEL_ID = "gemini-2.5-flash";

const solarAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    usableRoofAreaSqM: { type: Type.NUMBER, description: "Estimated flat, usable roof area in square meters free of obstructions." },
    numberOfPanels: { type: Type.NUMBER, description: "Number of 400W panels that fit (1 panel = 2 sq meters)." },
    systemCapacityKw: { type: Type.NUMBER, description: "Total system capacity in kW (Panels * 0.4)." },
    dailyGenerationKwh: { type: Type.NUMBER, description: "Daily energy generation in kWh." },
    monthlyGenerationKwh: { type: Type.NUMBER, description: "Monthly energy generation in kWh." },
    monthlySavingsInr: { type: Type.NUMBER, description: "Estimated monthly savings in Indian Rupees (₹8/unit)." },
    yearlySavingsInr: { type: Type.NUMBER, description: "Estimated yearly savings in Indian Rupees." },
    estimatedSubsidyInr: { type: Type.NUMBER, description: "Subsidy amount based on PM Surya Ghar rules." },
    roiYears: { type: Type.NUMBER, description: "Return on investment period in years." },
    reasoning: { type: Type.STRING, description: "A short, encouraging summary of the analysis and roof suitability." },
  },
  required: ["usableRoofAreaSqM", "numberOfPanels", "systemCapacityKw", "monthlyGenerationKwh", "estimatedSubsidyInr", "reasoning"],
};

const applianceDetectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    appliances: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          wattage: { type: Type.NUMBER, description: "Average wattage in India" },
          quantity: { type: Type.NUMBER },
          category: { type: Type.STRING, enum: ['cooling', 'heating', 'lighting', 'entertainment', 'kitchen', 'other'] }
        }
      }
    }
  }
};

const efficiencyAuditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    appliances: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          detectedCondition: { type: Type.STRING, enum: ['Old/Inefficient', 'Modern/Efficient'] },
          currentWattage: { type: Type.NUMBER, description: "Estimated wattage of the detected device" },
          efficientWattage: { type: Type.NUMBER, description: "Wattage of a modern 5-star equivalent" },
          monthlyEnergyLossKwh: { type: Type.NUMBER, description: "Difference in kWh assuming 6 hours daily usage" },
          monthlyMoneyLossInr: { type: Type.NUMBER, description: "Loss in Rupees at ₹8/unit" },
          replacementRecommendation: { type: Type.STRING, description: "Specific advice (e.g., Replace CFL with LED)" }
        }
      }
    },
    totalMonthlyLossInr: { type: Type.NUMBER },
    efficiencyScore: { type: Type.NUMBER, description: "Score from 0 (Wasteful) to 100 (Efficient)" },
    analysisSummary: { type: Type.STRING }
  }
};

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSolarPotential = async (
  base64Image: string,
  region: IndianRegion
): Promise<SolarAnalysisResult> => {
  const ai = getAiClient();
  const sunHours = REGION_SUN_HOURS[region];

  const prompt = `
    You are "Sun-Sathi", an expert solar engineer for India.
    
    Analyze the provided image of a roof. 
    1. Identify flat, shadow-free areas suitable for solar panels.
    2. Estimate the Usable Roof Area in Square Meters ($m^2$). Be realistic about obstructions (tanks, stairs).
    3. Perform the following calculations based on the region and rules provided:

    **Input Context:**
    - Region: ${region}
    - Average Peak Sun Hours: ${sunHours} hours/day
    - Electricity Rate: ₹8 per Unit (kWh)
    - Panel Specs: 400W (0.4kW) per panel. Size: 2 $m^2$ per panel. Panel Efficiency: 20%.
    
    **Formulas:**
    - Number of Panels = Usable Roof Area / 2 (Round down).
    - System Capacity (kW) = Number of Panels * 0.4.
    - Daily Generation (kWh) = System Capacity * ${sunHours}.
    - Monthly Generation (kWh) = Daily Generation * 30.
    - Monthly Savings (₹) = Monthly Generation * 8.
    - Yearly Savings (₹) = Monthly Savings * 12.
    
    **Subsidy Calculation (PM Surya Ghar Yojana):**
    ${PM_SURYA_GHAR_RULES}
    
    **ROI Calculation:**
    - Estimated Installation Cost (Approx) = System Capacity * ₹50,000.
    - Net Cost = Estimated Installation Cost - Estimated Subsidy.
    - ROI Years = Net Cost / Yearly Savings.

    Return the result in valid JSON format.
    If the image is not a roof or is too unclear, return 0 for usableRoofAreaSqM and explain in 'reasoning'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: {
        parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: solarAnalysisSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const result = JSON.parse(response.text) as SolarAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the image. Please try again with a clearer photo.");
  }
};

export const detectAppliancesFromImage = async (base64Image: string): Promise<Appliance[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Identify electrical appliances in this image. 
    For each identified item, estimate:
    1. A common Indian household Wattage (e.g., Ceiling Fan 75W).
    2. Quantity visible.
    3. Category (cooling, heating, lighting, entertainment, kitchen, other).
    
    Return a JSON object with an array 'appliances'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: applianceDetectionSchema,
      }
    });

    if(!response.text) throw new Error("No response from Gemini.");
    
    const data = JSON.parse(response.text);
    const appliances = data.appliances.map((app: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      name: app.name,
      wattage: app.wattage,
      quantity: app.quantity,
      dailyHours: 4, // Default conservative estimate
      category: app.category
    }));

    return appliances;
  } catch (error) {
    console.error("Gemini Appliance Detection Error:", error);
    throw new Error("Could not identify appliances. Please try again.");
  }
}

export const analyzeVideoEfficiency = async (base64Video: string, mimeType: string): Promise<EfficiencyResult> => {
  const ai = getAiClient();

  const prompt = `
    Analyze this video of a room in an Indian household. 
    Scan for electrical appliances (Fans, Lights, ACs, Fridges, TVs).
    
    For each appliance detected:
    1. Determine if it looks "Old/Inefficient" (e.g., boxy CRT TV, yellowed plastic AC, incandescent bulb, thick blade fan) OR "Modern/Efficient" (e.g., LED, BLDC Fan, Inverter AC).
    2. Estimate its *Current Wattage* based on its visual age.
    3. Estimate the *Efficient Wattage* of a modern 5-Star rated replacement.
    4. Calculate monthly energy loss assuming standard usage (AC=8hrs, Light=6hrs, Fan=12hrs).
    5. Calculate money loss at ₹8/unit.

    Return a comprehensive JSON report including a total 'Efficiency Score' (0-100) and a summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Video } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: efficiencyAuditSchema,
      }
    });

    if (!response.text) throw new Error("No response from Gemini.");
    return JSON.parse(response.text) as EfficiencyResult;

  } catch (error) {
    console.error("Gemini Video Analysis Error:", error);
    throw new Error("Failed to analyze video. Ensure file is < 10MB and format is supported.");
  }
};