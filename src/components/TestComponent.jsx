import React from 'react';

const TestComponent = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎉 React App is Working!
        </h1>
        <p className="text-gray-600 text-lg">
          Your ParkEasy application is successfully running.
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Quick Test</h2>
          <p className="text-sm text-gray-500">
            If you can see this, your React setup is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;