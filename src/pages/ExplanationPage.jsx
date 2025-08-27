import React from 'react';

const ExplanationPage = () => {
  return (
    <div className="w-full h-screen bg-[#000000] relative overflow-hidden">
      {/* Very dark grayish color gradient at the top */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#333333] to-transparent"></div>
      
      {/* Content area for the explanation text */}
      <div className="relative w-full h-full flex items-center justify-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold">ExplanationPage Content</h1>
      </div>
    </div>
  );
};

export default ExplanationPage;