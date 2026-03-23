import React from 'react';

const MapOne: React.FC = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">Map</h4>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-500">Map visualization will appear here</p>
      </div>
    </div>
  );
};

export default MapOne;