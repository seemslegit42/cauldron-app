import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@src/shared/components/ui/Button';

/**
 * TestPage - A simple test page to verify that our new Phantom UI is working
 */
export default function TestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold">Phantom UI Test Page</h1>
        <p className="text-center text-gray-400">
          This page is used to test the new Phantom UI components.
        </p>
        <div className="space-y-4">
          <Link to="/phantom" className="block w-full">
            <Button className="w-full">Go to Original Phantom UI</Button>
          </Link>
          <Link to="/phantom-new" className="block w-full">
            <Button className="w-full" variant="primary">Go to New Phantom UI</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
