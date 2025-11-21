"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FormField } from '@/components/form-field';
import { FormBottomActions } from '@/components/form-bottom-actions';
import { FileText } from "lucide-react";
import { createPetitionTemplate, updatePetitionTemplate, PetitionContextTemplate } from '@/lib/actions/petition-templates';
import { getDefaultPetitions } from '@/lib/actions/parish-settings';
import { PETITION_MODULE_VALUES, PETITION_MODULE_LABELS, PETITION_LANGUAGE_VALUES, PETITION_LANGUAGE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FormSectionCard } from "@/components/form-section-card";

interface PetitionTemplateFormProps {
  template?: PetitionContextTemplate;
  templateSettings?: string;
}

export default function PetitionTemplateForm({ template }: PetitionTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    context: template?.context || '',
    module: template?.module || '',
    language: template?.language || 'en'
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
          context: formData.context,
          module: formData.module || undefined,
          language: formData.language || undefined
        });

        toast.success('Template updated successfully');
      } else {
        // Create new template
        const newTemplate = await createPetitionTemplate({
          title: formData.title,
          description: formData.description,
          context: formData.context,
          module: formData.module || undefined,
          language: formData.language || undefined
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
      <FormSectionCard title="Template Information">
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

        <FormField
          id="module"
          label="Module"
          inputType="select"
          value={formData.module}
          onChange={(value) => setFormData({ ...formData, module: value })}
          options={[
            { value: '', label: 'Select a module...' },
            ...PETITION_MODULE_VALUES.map(module => ({
              value: module,
              label: PETITION_MODULE_LABELS[module].en
            }))
          ]}
          description="Which module should use this template?"
        />

        <FormField
          id="language"
          label="Language"
          inputType="select"
          value={formData.language}
          onChange={(value) => setFormData({ ...formData, language: value })}
          options={PETITION_LANGUAGE_VALUES.map(lang => ({
            value: lang,
            label: PETITION_LANGUAGE_LABELS[lang].en
          }))}
          required
          description="Language of the petition template"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label>Template Text</label>
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
      </FormSectionCard>


      <FormBottomActions
        isEditing={!!template}
        isLoading={loading}
        cancelHref={template ? `/settings/petitions/${template.id}` : '/settings/petitions'}
        moduleName="Petition Template"
      />
    </form>
  );
}