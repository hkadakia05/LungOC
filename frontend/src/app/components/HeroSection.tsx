import { Brain, Sparkles, Shield, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 mb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 inline mr-2" />
              AI-Powered Detection
            </div>
            <h1 className="text-5xl font-bold text-blue-900 mb-4 leading-tight">
              Early Detection
              <span className="block text-blue-600">Saves Lives</span>
            </h1>
            <p className="text-blue-700 text-lg mb-8 leading-relaxed">
              Our advanced AI technology analyzes CT scans to identify potential lung cancer risks, 
              helping medical professionals make faster, more informed decisions.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">AI Powered</h3>
                  <p className="text-blue-600 text-xs">Deep learning analysis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">Fast Results</h3>
                  <p className="text-blue-600 text-xs">Under 2 seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">95% Accurate</h3>
                  <p className="text-blue-600 text-xs">Clinically validated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">Easy to Use</h3>
                  <p className="text-blue-600 text-xs">Simple interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 border-4 border-blue-100">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1539814858141-928517f6afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MjM5ODIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Medical professional"
                className="w-full h-80 object-cover rounded-xl"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg">
                <p className="text-sm font-semibold">🔒 Secure Patient Data • Get Expert Help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
