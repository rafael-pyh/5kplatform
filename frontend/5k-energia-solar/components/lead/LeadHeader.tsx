"use client";

import Image from 'next/image';
import React from 'react';

const LeadHeader = ({ sellerName }: { sellerName: string }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center mb-4">
        <Image
          src="/5klogo.png"
          alt="5K Energia Solar"
          width={160}
          height={160}
        />
      </div>
      <p className="text-gray-600 mt-2">Cadastro de interesse - Vendedor: <span className="font-semibold">{sellerName}</span></p>
    </div>
  );
};

export default LeadHeader;
