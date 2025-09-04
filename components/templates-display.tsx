"use client";

import React, { useState, useEffect } from 'react';
import { Template } from '../lib/template-utils';
import { localTemplatesData } from '@/data/templates';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TemplatesDisplayProps {
  className?: string;
}

export function TemplatesDisplay({ className }: TemplatesDisplayProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch community templates from v1 API (ApiTemplate[])
      const response = await fetch('/api/v1/templates');
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      
      type ApiTemplate = { githubOrg: string; githubRepo: string; title: string; description: string; imageUrl: string };
      const apiData: ApiTemplate[] = await response.json();

      // Convert ApiTemplate[] to Template[] for UI and mark as community
      const community: Template[] = apiData.map((t) => ({
        id: `${t.githubOrg}/${t.githubRepo}`,
        title: t.title,
        description: t.description,
        imageUrl: t.imageUrl,
        githubUrl: `https://github.com/${t.githubOrg}/${t.githubRepo}`,
        isOfficial: false,
      }));

      // Merge with local official templates from data file
      const officials: Template[] = localTemplatesData
        .filter((t) => t.isOfficial)
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          imageUrl: t.imageUrl,
          githubUrl: t.githubUrl,
          isOfficial: true,
        }));

      setTemplates([...officials, ...community]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Templates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshTemplates = async () => {
    // For v1 API, simply re-fetch
    await fetchTemplates();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchTemplates} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Available Templates</h2>
        <Button onClick={refreshTemplates} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No templates available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
            >
              {template.imageUrl && (
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{template.title}</h3>
                {template.isOfficial && (
                  <Badge variant="secondary">Official</Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{template.description}</p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(template.githubUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  View on GitHub
                </Button>
                <Button
                  onClick={() => {
                    // This would typically trigger template usage
                    console.log('Using template:', template.id);
                  }}
                  size="sm"
                  className="flex-1"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
