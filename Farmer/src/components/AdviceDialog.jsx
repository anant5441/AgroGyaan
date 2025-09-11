import React from 'react';
import { X, Shield, Stethoscope, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

export function AdviceDialog({ open, onClose, advice, loading, diseaseName }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-[#8FA31E] text-xl">
            <Stethoscope className="w-6 h-6" />
            <span>Treatment Advice for {diseaseName}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-[#8FA31E] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating personalized treatment recommendations...</p>
          </div>
        ) : advice ? (
          <div className="space-y-6">
            {/* Precautions Section */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#FEE8D9' }}>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-[#EDA35A]" />
                <h3 className="text-lg text-[#8FA31E]">Precautions</h3>
              </div>
              <ul className="space-y-3">
                {advice.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: '#EDA35A' }}
                    ></div>
                    <p className="text-gray-700">{precaution}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatment Section */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E1E9C9' }}>
              <div className="flex items-center space-x-2 mb-4">
                <Stethoscope className="w-6 h-6 text-[#8FA31E]" />
                <h3 className="text-lg text-[#8FA31E]">Treatment Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {advice.treatment.map((treatment, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: '#8FA31E' }}
                    ></div>
                    <p className="text-gray-700">{treatment}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Note */}
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> These recommendations are AI-generated suggestions. 
                For severe infections or persistent problems, please consult with a local agricultural expert or plant pathologist.
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                className="px-8 py-3 rounded-full"
                style={{
                  backgroundColor: '#8FA31E',
                  color: 'white',
                }}
              >
                Got It, Thanks!
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
