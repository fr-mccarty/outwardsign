"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FormField } from '@/components/form-field';
import { Save, Loader2, FileText } from "lucide-react";
import { createPetitionTemplate, updatePetitionTemplate, PetitionContextTemplate } from '@/lib/actions/petition-templates';
import { getDefaultPetitions } from '@/lib/actions/parish-settings';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PetitionTemplateFormProps {
  template?: PetitionContextTemplate;
  templateSettings?: string;
}

export default function PetitionTemplateForm({ template, templateSettings }: PetitionTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    context: template?.context || ''
  });

  const handleLoadDefaultPetitions = async () => {
    try {
      const defaultPetitions = await getDefaultPetitions()
      if (defaultPetitions) {
        setFormData(prev => ({
          ...prev,
          context: defaultPetitions
        }))
        toast.success('Default petition text loaded')
      } else {
        toast.info('No default petition text found in parish settings')
      }
    } catch (error) {
      console.error('Failed to load default petitions:', error)
      toast.error('Failed to load default petition text')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (template) {
        // Update existing template
        await updatePetitionTemplate({
          id: template.id,
          title: formData.title,
          description: formData.description,
          context: formData.context
        });
        
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const newTemplate = await createPetitionTemplate({
          title: formData.title,
          description: formData.description,
          context: formData.context
        });
        
        toast.success('Template created successfully');
        router.push(`/settings/petitions/${newTemplate.id}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="title"
            label="Template Title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            placeholder="e.g., Sunday Mass (English)"
            required
          />
          
          <FormField
            id="description"
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Brief description of when to use this template"
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Template Text</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDefaultPetitions}
              >
                <FileText className="h-4 w-4 mr-2" />
                Insert Default Text
              </Button>
            </div>
            <FormField
              id="context"
              label=""
              inputType="textarea"
              value={formData.context}
              onChange={(value) => setFormData({ ...formData, context: value })}
              placeholder="Enter the template text for this template..."
              rows={10}
              description="This is the template text that will be used when creating a new petition with this template. Users can edit it later."
            />
          </div>
        </CardContent>
      </Card>


      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {template ? 'Update Template' : 'Create Template'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/settings/petitions')}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}