import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[#0d1117] text-white rounded p-1 flex items-center font-bold text-sm">
            <i className="fa-brands fa-github"></i>
            <span className="bg-[#0a66c2] text-white text-[8px] px-1 ml-1 rounded">in</span>
          </div>
          <span className="text-sm font-bold text-slate-900">
            Project<span className="text-[#0a66c2]">Space</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="text-slate-500 text-xs">
          © {new Date().getFullYear()} ProjectSpace Inc. All rights reserved.
        </div>

        {/* Links */}
        <div className="flex gap-6 text-slate-500 text-xs font-semibold">
          <a href="#" className="hover:text-linkedin-blue">Tentang</a>
          <a href="#" className="hover:text-linkedin-blue">Kebijakan</a>
          <a href="#" className="hover:text-linkedin-blue">Bantuan</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;