import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, FileText } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

interface PreHealthFormProps {
  age: number;
  smokingPackYears: number;
  familyHistory: boolean;
  riskScore: number;
}

export function PreHealthForm({ age, smokingPackYears, familyHistory, riskScore }: PreHealthFormProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    location: "",
    age: "",
    smokingHistory: "",
    packYears: "",
    currentSmoker: false,
    formerSmoker: false,
    neverSmoked: false,
    familyHistory: false,
    symptomatic: false,
    eligibleForScreening: false,
  });

  useEffect(() => {
    // Simulate auto-filling animation
    const timeouts: NodeJS.Timeout[] = [];
    
    const fields = [
      { key: "fullName", value: "Patient Record", delay: 300 },
      { key: "email", value: "hkadakia@ucsc.edu", delay: 600 },
      { key: "location", value: "UC Santa Cruz", delay: 900 },
      { key: "age", value: age.toString(), delay: 1200 },
      { key: "packYears", value: smokingPackYears.toString(), delay: 1500 },
    ];

    fields.forEach(({ key, value, delay }) => {
      const timeout = setTimeout(() => {
        setFormData(prev => ({ ...prev, [key]: value }));
      }, delay);
      timeouts.push(timeout);
    });

    // Set checkboxes
    const checkboxTimeout = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        currentSmoker: smokingPackYears > 0,
        neverSmoked: smokingPackYears === 0,
        familyHistory: familyHistory,
        symptomatic: false,
        eligibleForScreening: age >= 50 && age <= 77 && smokingPackYears >= 20,
      }));
      setIsAutoFilling(false);
    }, 1800);
    timeouts.push(checkboxTimeout);

    // Cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [age, smokingPackYears, familyHistory]);

  const meetsLDCTCriteria = age >= 50 && age <= 77 && smokingPackYears >= 20;

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-green-900 text-lg font-semibold">Pre-Screening Health Form</h4>
          <p className="text-green-600 text-sm">Auto-populated by MediScan AI</p>
        </div>
        {isAutoFilling && (
          <div className="ml-auto flex items-center gap-2 text-green-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Auto-filling...</span>
          </div>
        )}
        {!isAutoFilling && (
          <div className="ml-auto flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 space-y-6">
        {/* Patient Information */}
        <div className="space-y-4">
          <h5 className="text-blue-900 font-semibold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Patient Information
          </h5>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-700 text-sm mb-2 block">Full Name</Label>
              <Input
                value={formData.fullName}
                readOnly
                className="bg-blue-50 border-blue-200"
              />
            </div>
            
            <div>
              <Label className="text-blue-700 text-sm mb-2 block">Age</Label>
              <Input
                value={formData.age}
                readOnly
                className="bg-blue-50 border-blue-200"
              />
            </div>
          </div>

          <div>
            <Label className="text-blue-700 text-sm mb-2 block">Email Address</Label>
            <Input
              value={formData.email}
              readOnly
              className="bg-blue-50 border-blue-200"
            />
          </div>

          <div>
            <Label className="text-blue-700 text-sm mb-2 block">Location</Label>
            <Input
              value={formData.location}
              readOnly
              className="bg-blue-50 border-blue-200"
            />
          </div>
        </div>

        {/* Smoking History */}
        <div className="space-y-4 pt-4 border-t border-blue-100">
          <h5 className="text-blue-900 font-semibold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Tobacco Smoking History
          </h5>

          <div>
            <Label className="text-blue-700 text-sm mb-2 block">Pack-Years</Label>
            <Input
              value={formData.packYears}
              readOnly
              className="bg-blue-50 border-blue-200"
            />
            <p className="text-xs text-blue-500 mt-1">
              (1 pack-year = 1 pack/day for 1 year)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.currentSmoker}
                disabled
                className="border-blue-300"
              />
              <Label className="text-blue-800 text-sm">Current Smoker</Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.formerSmoker}
                disabled
                className="border-blue-300"
              />
              <Label className="text-blue-800 text-sm">Former Smoker (quit within 15 years)</Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.neverSmoked}
                disabled
                className="border-blue-300"
              />
              <Label className="text-blue-800 text-sm">Never Smoked</Label>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-4 pt-4 border-t border-blue-100">
          <h5 className="text-blue-900 font-semibold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Additional Risk Factors
          </h5>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.familyHistory}
                disabled
                className="border-blue-300"
              />
              <Label className="text-blue-800 text-sm">Family History of Lung Cancer</Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.symptomatic}
                disabled
                className="border-blue-300"
              />
              <Label className="text-blue-800 text-sm">Currently Symptomatic (signs/symptoms of lung cancer)</Label>
            </div>
          </div>
        </div>

        {/* LDCT Screening Eligibility */}
        <div className="pt-4 border-t border-blue-100">
          <div className={`p-4 rounded-xl border-2 ${
            meetsLDCTCriteria 
              ? 'bg-green-50 border-green-300' 
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {meetsLDCTCriteria ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">!</div>
              )}
              <div>
                <h6 className={`font-semibold mb-1 ${meetsLDCTCriteria ? 'text-green-900' : 'text-amber-900'}`}>
                  {meetsLDCTCriteria ? '✓ Meets LDCT Screening Criteria' : 'LDCT Screening Criteria'}
                </h6>
                <p className={`text-sm ${meetsLDCTCriteria ? 'text-green-700' : 'text-amber-700'}`}>
                  {meetsLDCTCriteria 
                    ? 'Patient meets Medicare/USPSTF criteria for low-dose CT lung cancer screening (Age 50-77, ≥20 pack-years).'
                    : 'Patient does not currently meet standard LDCT screening criteria. Criteria: Age 50-77 years + ≥20 pack-years smoking history.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assessment Summary */}
        <div className="pt-4 border-t border-blue-100">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
            <h6 className="text-blue-900 font-semibold mb-2 text-sm">AI Risk Assessment Summary</h6>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 text-sm">Calculated Malignancy Risk Score:</span>
              <span className="text-blue-900 font-bold text-lg">{riskScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}