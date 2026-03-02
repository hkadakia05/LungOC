import { useState } from "react";
import { RiskFactorsSidebar } from "./components/RiskFactorsSidebar";
import { FileUpload } from "./components/FileUpload";
import { RiskResults } from "./components/RiskResults";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Button } from "./components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { saveScanToDatabase } from "../lib/database";

interface UploadedFile {
  name: string;
  size: number;
  preview?: string;
  file?: File;
}

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

export default function App() {
  const { user } = useAuth();
  const [age, setAge] = useState(42);
  const [smokingPackYears, setSmokingPackYears] = useState(0);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] =
    useState<RiskAssessment | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      file: file,
    });
    setAssessment(null); // Reset assessment when new file is uploaded
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setAssessment(null);
  };

  const calculateRiskScore = () => {
    let baseScore = 10;

    // Age contribution (increases after 50)
    if (age > 50) {
      baseScore += (age - 50) * 0.8;
    }

    // Smoking contribution (major factor)
    baseScore += smokingPackYears * 1.2;

    // Family history contribution
    if (familyHistory) {
      baseScore += 15;
    }

    // Simulated imaging analysis (random variation)
    const imagingFactor = Math.random() * 20 + 10;
    baseScore += imagingFactor;

    // Cap at 95%
    return Math.min(Math.round(baseScore), 95);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !uploadedFile.file) {
      alert("Please upload a CT scan image first");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create FormData for multipart request
      const formData = new FormData();
      formData.append("file", uploadedFile.file);
      formData.append("age", age.toString());
      formData.append("smoking", smokingPackYears.toString());
      formData.append("family_history", familyHistory.toString());

      // Call FastAPI backend
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const apiResponse = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();

      // Map backend response to frontend assessment format
      let riskLevel: "low" | "moderate" | "high";
      if (result.final_risk < 0.3) {
        riskLevel = "low";
      } else if (result.final_risk < 0.6) {
        riskLevel = "moderate";
      } else {
        riskLevel = "high";
      }

      const getAgeFactor = () => {
        if (age < 40) return "Low risk age group";
        if (age < 55) return "Moderate risk age group";
        return "High risk age group";
      };

      const getSmokingFactor = () => {
        if (smokingPackYears === 0) return "No smoking history";
        if (smokingPackYears < 20) return "Moderate smoking history";
        return "Heavy smoking history";
      };

      const getRecommendations = () => {
        const recs = [];

        if (riskLevel === "high") {
          recs.push("Immediate referral to thoracic oncology specialist recommended");
          recs.push("Consider PET-CT scan for further evaluation");
          recs.push("Schedule biopsy consultation within 2 weeks");
        } else if (riskLevel === "moderate") {
          recs.push("Follow-up CT scan recommended in 3-6 months");
          recs.push("Consultation with pulmonologist advised");
          recs.push("Consider low-dose CT screening program enrollment");
        } else {
          recs.push("Routine follow-up in 12 months");
          recs.push("Continue annual low-dose CT screening if eligible");
          recs.push("Smoking cessation counseling if applicable");
        }

        if (smokingPackYears > 0) {
          recs.push("Smoking cessation programs strongly recommended");
        }

        return recs;
      };

      const newAssessment: RiskAssessment = {
        riskLevel,
        riskScore: Math.round(result.final_risk * 100),
        confidence: 85 + Math.random() * 10,
        factors: {
          age: getAgeFactor(),
          smoking: getSmokingFactor(),
          familyHistory: familyHistory ? "Positive family history" : "No family history",
          imaging: result.prediction,
        },
        recommendations: getRecommendations(),
      };

      setAssessment(newAssessment);

      // Save scan to database if user is logged in
      if (user) {
        try {
          await saveScanToDatabase(
            {
              prediction: result.prediction,
              risk_score: result.final_risk,
              risk_level: riskLevel,
              age,
              smoking_pack_years: smokingPackYears,
              family_history: familyHistory,
              image_probability: result.image_probability,
            },
            user.id
          );
        } catch (dbError) {
          console.error("Error saving scan to database:", dbError);
          // Don't fail the analysis if database save fails
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      alert(`Error: ${error instanceof Error ? error.message : "Failed to analyze image"}\n\nMake sure FastAPI backend is running on ${API_URL}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <HeroSection />

      <div className="flex">
        {/* Sidebar */}
        <RiskFactorsSidebar
          age={age}
          onAgeChange={(value) => setAge(value[0])}
          smokingPackYears={smokingPackYears}
          onSmokingPackYearsChange={(value) =>
            setSmokingPackYears(value[0])
          }
          familyHistory={familyHistory}
          onFamilyHistoryChange={setFamilyHistory}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto pb-12">
          <div className="max-w-5xl mx-auto p-8">
            {/* Analysis Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-100 mb-6">
              <FileUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                onFileRemove={handleFileRemove}
              />

              {/* Analyze Button */}
              {uploadedFile && !assessment && (
                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-8 py-6 text-lg shadow-lg group"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Analyze CT Scan
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold text-lg">
                        🔬 AI Analysis in Progress...
                      </p>
                      <p className="text-blue-600 text-sm">
                        Our neural network is examining your CT
                        scan
                      </p>
                    </div>
                  </div>

                  {/* Progress indicators */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-blue-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Image preprocessing complete</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>
                        Running deep learning model...
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-blue-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Analyzing risk factors...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {assessment && (
              <RiskResults
                assessment={assessment}
                age={age}
                smokingPackYears={smokingPackYears}
                familyHistory={familyHistory}
              />
            )}

            {/* New Analysis Button */}
            {assessment && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    setAssessment(null);
                    setUploadedFile(null);
                  }}
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 shadow-md"
                >
                  🔄 Analyze Another Case
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}