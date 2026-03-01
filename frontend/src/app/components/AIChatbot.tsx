import { useState, useEffect, useRef } from "react";
import { Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "ai" | "user";
  content: string;
}

interface AIChatbotProps {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  age: number;
  smokingPackYears: number;
  familyHistory: boolean;
}

export function AIChatbot({ riskLevel, riskScore, age, smokingPackYears, familyHistory }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset messages first
    setMessages([]);
    
    // Initial AI explanation
    const timeouts: NodeJS.Timeout[] = [];
    const initialMessages: Message[] = [
      {
        role: "ai",
        content: "👋 Hi! I'm MediScan AI. Let me walk you through how I analyzed this case."
      }
    ];

    // Add messages with delays
    const addMessage = (message: Message, delay: number) => {
      const timeout = setTimeout(() => {
        setMessages(prev => [...prev, message]);
      }, delay);
      timeouts.push(timeout);
    };

    addMessage(initialMessages[0], 500);

    addMessage({
      role: "ai",
      content: `🔍 **Step 1: Patient Risk Factors Analysis**\n\nI evaluated the patient's baseline risk factors:\n• Age: ${age} years ${age > 55 ? '(Higher risk group)' : age > 40 ? '(Moderate risk group)' : '(Lower risk group)'}\n• Smoking: ${smokingPackYears} pack-years ${smokingPackYears >= 20 ? '(Meets LDCT screening criteria)' : smokingPackYears > 0 ? '(Increased risk)' : '(No smoking history)'}\n• Family History: ${familyHistory ? 'Yes (Genetic risk factor present)' : 'No (No genetic risk)'}`
    }, 1500);

    addMessage({
      role: "ai",
      content: `🧠 **Step 2: CT Scan Image Analysis**\n\nMy neural network examined the CT scan for:\n• Nodule detection and classification\n• Density and morphology patterns\n• Location and size measurements\n• Calcification patterns\n• Comparison with normal lung tissue`
    }, 3000);

    addMessage({
      role: "ai",
      content: `📊 **Step 3: Risk Score Calculation**\n\nI combined multiple factors using a weighted algorithm:\n• Clinical risk factors: ${Math.round((age > 50 ? (age - 50) * 0.8 : 0) + smokingPackYears * 1.2 + (familyHistory ? 15 : 0))}%\n• Imaging findings contributed additional risk\n• Final computed risk: **${riskScore}%** = **${riskLevel.toUpperCase()} RISK**`
    }, 4500);

    if (riskLevel === "high") {
      addMessage({
        role: "ai",
        content: `⚠️ **Clinical Significance**\n\nThe high risk score indicates suspicious findings that warrant immediate medical attention. This doesn't mean cancer is confirmed, but rather that further diagnostic workup is recommended to rule out malignancy.`
      }, 6000);
    } else if (riskLevel === "moderate") {
      addMessage({
        role: "ai",
        content: `💡 **Clinical Significance**\n\nThe moderate risk score suggests indeterminate findings. Close monitoring with follow-up imaging is recommended to track any changes over time.`
      }, 6000);
    } else {
      addMessage({
        role: "ai",
        content: `✅ **Clinical Significance**\n\nThe low risk score indicates no significant abnormalities detected. Routine screening schedule is appropriate based on current guidelines.`
      }, 6000);
    }

    addMessage({
      role: "ai",
      content: `🎯 **Model Confidence & Limitations**\n\nMy confidence level is based on:\n• Quality of the CT scan image\n• Clarity of detected features\n• Consistency with training data\n\n**Important:** I'm a decision support tool. All findings must be verified by board-certified radiologists and clinical teams.`
    }, 7500);

    // Cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [age, smokingPackYears, familyHistory, riskLevel, riskScore]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-purple-900 text-lg font-semibold">AI Model Insights</h4>
          <p className="text-purple-600 text-sm">Understanding the analysis process</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-xl p-4 max-h-[500px] overflow-y-auto space-y-3 shadow-inner">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={`message-${index}-${message.content.substring(0, 20)}`}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "ai" && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3 ${
                  message.role === "ai"
                    ? "bg-purple-50 border border-purple-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p className={`text-sm whitespace-pre-line ${message.role === "ai" ? "text-purple-900" : "text-white"}`}>
                  {message.content}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8 text-purple-500">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}