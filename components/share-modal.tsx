import React from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    } else {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
          <Dialog.Title className="text-lg font-semibold mb-2">Share your itinerary</Dialog.Title>
          <div className="mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full border rounded px-2 py-1 text-gray-700 bg-gray-100"
              onFocus={e => e.target.select()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleCopy}>Copy Link</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 