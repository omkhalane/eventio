import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const ApiDocs = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center p-10 md:p-20 text-foreground">
      <div className="w-full max-w-4xl space-y-12">
        <Link
          to="/"
          className="text-primary flex w-fit items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-transform hover:translate-x-1"
        >
          <ChevronLeft className="h-3 w-3" /> Back to Home
        </Link>
        <h1 className="text-6xl font-black tracking-tight">API Documentation</h1>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-border pb-2">Base URL</h2>
            <code className="bg-muted px-4 py-2 rounded-md block">http://localhost:3000/api/v1</code>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-border pb-2">Endpoints</h2>
            
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded font-bold">GET</span>
                  <code className="text-lg font-mono">/events</code>
                </div>
                <p className="text-muted-foreground">Fetch a list of upcoming and past competitive programming events.</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Query Parameters</h4>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2">Parameter</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-border/50">
                        <td className="py-2 font-mono">platforms</td>
                        <td className="py-2 text-muted-foreground">string</td>
                        <td className="py-2">Comma-separated list of platform IDs (e.g. <code className="bg-muted px-1 rounded">codeforces,leetcode</code>)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 font-mono">startDate</td>
                        <td className="py-2 text-muted-foreground">string (ISO 8601)</td>
                        <td className="py-2">Filter events starting after this date</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">endDate</td>
                        <td className="py-2 text-muted-foreground">string (ISO 8601)</td>
                        <td className="py-2">Filter events starting before this date</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Response Example</h4>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Educational Codeforces Round 165",
      "descriptionText": "Codeforces Contest 1968",
      "startTime": "2024-04-27T14:35:00.000Z",
      "platformsJson": ["codeforces"],
      "tagsJson": ["competitive-programming"]
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
