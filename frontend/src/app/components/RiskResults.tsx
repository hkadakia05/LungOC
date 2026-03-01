import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { AIChatbot } from "./AIChatbot";
import { PreHealthForm } from "./PreHealthForm";

interface RiskAssessment {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  confidence: number;
  factors: {
    age: string;
    smoking: string;
    familyHistory: string;
    imaging: string;
  };
  recommendations: string[];
}

interface RiskResultsProps {
  assessment: RiskAssessment;
  age: number;
  smokingPackYears: number;
  familyHistory: boolean;
}

export function RiskResults({ assessment, age, smokingPackYears, familyHistory }: RiskResultsProps) {
  const getRiskColor = () => {
    switch (assessment.riskLevel) {
      case "low":
        return "text-green-600";
      case "moderate":
        return "text-amber-600";
      case "high":
        return "text-red-600";
      default:
        return "text-blue-400";
    }
  };

  const getRiskBgColor = () => {
    switch (assessment.riskLevel) {
      case "low":
        return "bg-green-50 border-green-200";
      case "moderate":
        return "bg-amber-50 border-amber-200";
      case "high":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getRiskIcon = () => {
    switch (assessment.riskLevel) {
      case "low":
        return <CheckCircle className="w-8 h-8" />;
      case "moderate":
        return <AlertCircle className="w-8 h-8" />;
      case "high":
        return <XCircle className="w-8 h-8" />;
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Risk Score Display */}
      <div className={`rounded-xl p-6 border-2 ${getRiskBgColor()}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={getRiskColor()}>
            {getRiskIcon()}
          </div>
          <div>
            <h3 className="text-blue-900 text-2xl font-semibold capitalize">
              {assessment.riskLevel} Risk
            </h3>
            <p className="text-blue-600 text-sm">Malignancy Risk Assessment</p>
          </div>
        </div>
        
        <div className="space-y-4 bg-white rounded-lg p-5 border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Risk Score</span>
            <span className={`text-2xl font-bold ${getRiskColor()}`}>
              {assessment.riskScore}%
            </span>
          </div>
          <Progress value={assessment.riskScore} className="h-3" />
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-blue-700 font-medium">AI Confidence</span>
            <span className="text-blue-900 font-semibold">{assessment.confidence}%</span>
          </div>
          <Progress value={assessment.confidence} className="h-2" />
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
        <h4 className="text-blue-900 text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          Contributing Factors
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Age Factor</span>
            <span className="text-blue-900 font-semibold">{assessment.factors.age}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Smoking History</span>
            <span className="text-blue-900 font-semibold">{assessment.factors.smoking}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Family History</span>
            <span className="text-blue-900 font-semibold">{assessment.factors.familyHistory}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Imaging Analysis</span>
            <span className="text-blue-900 font-semibold">{assessment.factors.imaging}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300 shadow-sm">
        <h4 className="text-blue-900 text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          Clinical Recommendations
        </h4>
        <ul className="space-y-3">
          {assessment.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 text-blue-800 bg-white p-3 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mt-0.5">
                {index + 1}
              </div>
              <span className="text-sm font-medium">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-900 text-sm font-medium leading-relaxed">
            <strong>Medical Disclaimer:</strong> This AI-assisted tool is for clinical decision support only. 
            All results must be verified by qualified medical professionals. This tool does not 
            replace clinical judgment or formal diagnostic procedures.
          </p>
        </div>
      </div>

      {/* AI Chatbot Section */}
      <AIChatbot 
        riskLevel={assessment.riskLevel}
        riskScore={assessment.riskScore}
        age={age}
        smokingPackYears={smokingPackYears}
        familyHistory={familyHistory}
      />

      {/* Pre-Health Form Section */}
      <PreHealthForm
        age={age}
        smokingPackYears={smokingPackYears}
        familyHistory={familyHistory}
        riskScore={assessment.riskScore}
      />
    </div>
  );
}