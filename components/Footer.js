import React from 'react';
import { FaTwitter, FaGithub, FaEnvelope, FaGlobe } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 px-4 sm:px-6 py-4 border-t border-gray-200 text-sm z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className='text-center sm:text-left'>
          <h2 className="font-bold text-gray-800 text-base">StudyMate</h2>
        </div>

        <div className="text-xs text-gray-500 order-last sm:order-none">
          &copy; {new Date().getFullYear()} StudyMate. All rights reserved.
        </div>

        <div className='flex items-center space-x-4 text-lg text-gray-500'>
          <a href="#" aria-label="Twitter" className="hover:text-blue-500 transition-colors duration-200">
            <FaTwitter />
          </a>
          <a href="#" aria-label="GitHub" className="hover:text-gray-900 transition-colors duration-200">
            <FaGithub />
          </a>
          <a href="#" aria-label="Email" className="hover:text-red-500 transition-colors duration-200">
            <FaEnvelope />
          </a>
          <a href="#" aria-label="Website" className="hover:text-green-500 transition-colors duration-200">
            <FaGlobe />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
