
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GarakScan } from './types';

interface GarakResultsProps {
  scans: GarakScan[];
}

export const GarakResults = ({ scans }: GarakResultsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${crypto.randomUUID()}.jsonl`;
      const { error: uploadError } = await supabase.storage
        .from('garak_scans')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Parse file content
      const text = await file.text();
      const lines = text.trim().split('\n');
      const probes = new Set<string>();
      const results: any[] = [];

      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          if (entry.probe_classname) {
            probes.add(entry.probe_classname.split('.')[0]);
            results.push(entry);
          }
        } catch (e) {
          console.error('Error parsing line:', e);
        }
      });

      // Create database entry
      const { error: dbError } = await supabase
        .from('garak_scans')
        .insert({
          name: file.name,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          file_path: fileName,
          probes: Array.from(probes),
          test_suites: [],
          results: results,
          status: 'completed'
        });

      if (dbError) throw dbError;

      toast({
        title: 'Upload successful',
        description: 'Your Garak scan results have been uploaded and processed.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload scan results',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <FileUp className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Upload Garak Results</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Upload your Garak scan results (.jsonl file) to analyze the security assessment of your LLM interactions
          </p>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".jsonl"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="garak-file-upload"
            />
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('garak-file-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Select File'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {scans.map((scan) => (
          <Card key={scan.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{scan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(scan.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Probes Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {scan.probes.map((probe) => (
                    <span
                      key={probe}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {probe}
                    </span>
                  ))}
                </div>
              </div>

              {scan.results && (
                <div className="space-y-2">
                  <h4 className="font-medium">Test Results:</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(scan.results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
