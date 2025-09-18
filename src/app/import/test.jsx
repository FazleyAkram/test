'use client';

import React from 'react';
import Header from '@/components/header/Header.jsx';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <Header />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Test Import Page</h1>
        <p className="text-primary">This is a test page to debug the import issue.</p>
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-primary">If you can see this, the page is working.</p>
        </div>
      </div>
    </div>
  );
} 