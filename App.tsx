import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StepIndicator } from './components/StepIndicator';
import { ProfileForm } from './components/ProfileForm';
import { FieldSelector } from './components/FieldSelector';
import { SuggestionCard } from './components/SuggestionCard';
import { UserProfile, RiskLevel, FinancialGoal, FinancialField, AnalysisResult } from './types';
import { generateFinancialAdvice } from './services/geminiService';

const CHART_COLORS = ['#6366f1', '#ef4444', '#10b981'];

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    age: 28,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    currentSavings: 0,
    riskLevel: RiskLevel.Medium,
    financialGoal: FinancialGoal.Wealth,
  });
  const [selectedFields, setSelectedFields] = useState<FinancialField[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleProfileChange = useCallback((field: keyof UserProfile, value: string | number | RiskLevel | FinancialGoal) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleField = useCallback((field: FinancialField) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }, []);

  const handleNext = () => {
    if (step === 1) {
       // Basic validation
       if (profile.monthlyIncome <= 0) {
           alert("Please enter a valid monthly income.");
           return;
       }
       setStep(2);
    } else if (step === 2) {
        if (selectedFields.length === 0) {
            alert("Please select at least one field for advice.");
            return;
        }
        analyzeProfile();
    }
  };

  const analyzeProfile = async () => {
    setLoading(true);
    try {
        const analysis = await generateFinancialAdvice(profile, selectedFields);
        setResult(analysis);
        setStep(3);
    } catch (e) {
        console.error(e);
        alert("Something went wrong generating advice.");
    } finally {
        setLoading(false);
    }
  };

  const handleRestart = () => {
      setStep(1);
      setResult(null);
      setSelectedFields([]);
  };

  // Chart Data Preparation
  const savingsRate = Math.max(0, profile.monthlyIncome - profile.monthlyExpenses);
  const chartData = [
    { name: 'Expenses', value: profile.monthlyExpenses },
    { name: 'Potential Savings', value: savingsRate },
    { name: 'Current Savings (Total)', value: profile.currentSavings }, // Visualized for context, though scale might differ
  ].filter(d => d.value > 0);
  
  // Simplified Chart for Income Breakdown
  const flowData = [
    { name: 'Expenses', value: profile.monthlyExpenses },
    { name: 'Savings Capacity', value: Math.max(0, profile.monthlyIncome - profile.monthlyExpenses) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                $
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">SmartFinance AI</span>
          </div>
          {step > 1 && (
            <button onClick={handleRestart} className="text-sm text-gray-500 hover:text-indigo-600 font-medium">
                Reset
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <StepIndicator currentStep={step} totalSteps={3} />

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-800">Analyzing Financial Profile...</h3>
                <p className="text-gray-500 mt-2 text-center max-w-sm">
                    Checking {selectedFields.length} data points against your goal of "{profile.financialGoal}".
                </p>
            </div>
        ) : (
            <>
                {step === 1 && <ProfileForm profile={profile} onChange={handleProfileChange} />}
                {step === 2 && <FieldSelector selectedFields={selectedFields} toggleField={toggleField} />}
                
                {step === 3 && result && (
                    <div className="animate-fade-in-up space-y-8">
                        {/* Summary Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                             <h2 className="text-xl font-bold mb-2">Financial Snapshot</h2>
                             <p className="text-gray-600 mb-6">{result.overview}</p>
                             
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={flowData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {flowData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="text-center text-sm text-gray-500 mt-2">
                                Monthly Cash Flow Breakdown
                             </div>
                        </div>

                        {/* Suggestions List */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Smart Suggestions</h2>
                            {result.suggestions.map((suggestion, idx) => (
                                <SuggestionCard key={idx} suggestion={suggestion} />
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}
      </main>

      {/* Sticky Action Footer */}
      {!loading && step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
                <button 
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${step === 1 ? 'invisible' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Back
                </button>
                <button 
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {step === 2 ? 'Generate Advice' : 'Next Step'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}