import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { User, Cigarette, Users } from "lucide-react";

interface RiskFactorsSidebarProps {
  age: number;
  onAgeChange: (value: number[]) => void;
  smokingPackYears: number;
  onSmokingPackYearsChange: (value: number[]) => void;
  familyHistory: boolean;
  onFamilyHistoryChange: (checked: boolean) => void;
}

export function RiskFactorsSidebar({
  age,
  onAgeChange,
  smokingPackYears,
  onSmokingPackYearsChange,
  familyHistory,
  onFamilyHistoryChange,
}: RiskFactorsSidebarProps) {
  return (
    <div className="w-80 bg-gradient-to-br from-blue-50 to-white border-r-2 border-blue-100 p-8 flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-blue-900 text-xl font-semibold">Patient Factors</h2>
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mt-2 rounded-full"></div>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Age Slider */}
        <div className="flex flex-col gap-3 bg-white p-5 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <Label htmlFor="age" className="text-blue-900 text-base font-medium">Age</Label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-600 text-3xl font-bold">{age}</span>
            <span className="text-blue-500 text-sm">years old</span>
          </div>
          <Slider
            id="age"
            min={20}
            max={90}
            step={1}
            value={[age]}
            onValueChange={onAgeChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-blue-400 font-medium">
            <span>20</span>
            <span>90</span>
          </div>
        </div>

        {/* Smoking Pack-Years Slider */}
        <div className="flex flex-col gap-3 bg-white p-5 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Cigarette className="w-4 h-4 text-blue-600" />
            <Label htmlFor="smoking" className="text-blue-900 text-base font-medium">Smoking History</Label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-600 text-3xl font-bold">{smokingPackYears}</span>
            <span className="text-blue-500 text-sm">pack-years</span>
          </div>
          <Slider
            id="smoking"
            min={0}
            max={60}
            step={1}
            value={[smokingPackYears]}
            onValueChange={onSmokingPackYearsChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-blue-400 font-medium">
            <span>0</span>
            <span>60</span>
          </div>
        </div>

        {/* Family History Checkbox */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <Checkbox
                id="family-history"
                checked={familyHistory}
                onCheckedChange={onFamilyHistoryChange}
                className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 float-right"
              />
              <Label 
                htmlFor="family-history" 
                className="text-blue-900 text-sm font-medium cursor-pointer block"
              >
                Family History
                <span className="block text-blue-500 text-xs font-normal mt-1">
                  Lung cancer in family
                </span>
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}