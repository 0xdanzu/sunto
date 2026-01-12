'use client';

import { Bookmark, Chrome, Smartphone } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Bookmark className="w-10 h-10 text-muted-foreground" />
      </div>

      <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Start saving tweets to build your personal digest. Here's how:
      </p>

      <div className="grid gap-4 w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-4 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium">On Mobile</h3>
          </div>
          <ol className="text-sm text-muted-foreground space-y-1 ml-[52px]">
            <li>1. Add Sunto to your Home Screen</li>
            <li>2. Open any tweet in the X app</li>
            <li>3. Tap Share → Select "Sunto"</li>
          </ol>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Chrome className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium">On Desktop</h3>
          </div>
          <ol className="text-sm text-muted-foreground space-y-1 ml-[52px]">
            <li>1. Install the Sunto Chrome extension</li>
            <li>2. Hover over any tweet</li>
            <li>3. Click the Sunto button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
