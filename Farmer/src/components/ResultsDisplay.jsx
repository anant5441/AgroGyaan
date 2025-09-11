import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export function ResultsDisplay({ results, isLoading, onClear, onGetAdvice }) {
  if (isLoading) {
    return (
      <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: '#E1E9C9' }}>
        <div className="flex justify-center mb-4">
          <RefreshCw className="w-12 h-12 text-[#8FA31E] animate-spin" />
        </div>
        <h3 className="text-xl text-[#8FA31E] mb-2">Analyzing Image...</h3>
        <p className="text-gray-600 mb-4">Our AI is examining your plant for potential diseases</p>
        <div className="max-w-xs mx-auto">
          <Progress value={65} className="w-full" />
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const confidence = Math.round(parseFloat(results.confidence) * 100);
  const isHealthy = results.class.toLowerCase().includes('healthy');
  
  const getStatusIcon = () => {
    if (isHealthy) {
      return <CheckCircle className="w-8 h-8 text-green-600" />;
    }
    return <AlertCircle className="w-8 h-8 text-orange-600" />;
  };

  const getStatusColor = () => {
    if (isHealthy) return 'bg-green-100 text-green-800';
    if (results.class.toLowerCase().includes('early')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Results Card */}
      <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E1E9C9' }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-2xl text-[#8FA31E]">Analysis Complete</h3>
              <p className="text-gray-600">Results from AI disease detection</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Disease Detection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-600">Disease Detected</label>
            <Badge className={`text-lg px-4 py-2 ${getStatusColor()}`}>
              {results.class}
            </Badge>
          </div>

          {/* Confidence Level */}
          <div className="space-y-3">
            <label className="text-sm text-gray-600">Confidence Level</label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg text-[#8FA31E]">{confidence}%</span>
                <span className="text-sm text-gray-500">
                  {confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low'} Confidence
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${getConfidenceColor()}`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onClear}
            variant="outline"
            className="px-8 py-3 rounded-full border-[#8FA31E] text-[#8FA31E] hover:bg-[#8FA31E] hover:text-white transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Analyze Another Image
          </Button>
          
          {!isHealthy && (
            <Button 
              onClick={onGetAdvice}
              className="px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: '#EDA35A',
                color: 'white'
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Get Treatment Advice
            </Button>
          )}
        </div>

        {isHealthy && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                Great news! Your plant appears to be healthy. Continue with regular care and monitoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
