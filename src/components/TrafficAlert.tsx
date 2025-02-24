import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TrafficAlertProps {
  onAccept: () => void;
  onDecline: () => void;
}

const TrafficAlert: React.FC<TrafficAlertProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-x-0 top-4 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 mx-4 max-w-md border-l-4 border-red-500">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Traffic Alert!</h3>
        </div>
        <p className="mt-2 text-gray-600">Traffic congestion detected ahead. Would you like to find an alternative route?</p>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Keep Current Route
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Find Alternative
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrafficAlert;