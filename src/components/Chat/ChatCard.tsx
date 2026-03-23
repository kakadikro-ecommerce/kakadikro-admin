import React from 'react';

const ChatCard: React.FC = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">Recent Activity</h4>
      <div className="p-4">
        <div className="flex items-center gap-5 py-3">
          <div className="flex-1">
            <p className="text-gray-600">Welcome to the admin panel!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;