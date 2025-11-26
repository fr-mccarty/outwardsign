"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { FormInput } from '@/components/form-input';
import { FormBottomActions } from '@/components/form-bottom-actions';
import { FileText } from "lucide-react";
import { createPetitionTemplate, updatePetitionTemplate, PetitionContextTemplate } from '@/lib/actions/petition-templates';
import { PETITION_MODULE_VALUES, PETITION_MODULE_LABELS, PETITION_LANGUAGE_VALUES, PETITION_LANGUAGE_LABELS, DEFAULT_PETITIONS } from '@/lib/constants';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FormSectionCard } from "@/components/form-section-card";

// Validation schema
const petitionTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  context: z.string().min(1, 'Template text is required'),
  module: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
});

type PetitionTemplateFormValues = z.infer<typeof petitionTemplateSchema>;

interface PetitionTemplateFormProps {
  template?: PetitionContextTemplate;
  templateSettings?: string;
}

export default function PetitionTemplateForm({ template }: PetitionTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<PetitionTemplateFormValues>({
    resolver: zodResolver(petitionTemplateSchema),
    defaultValues: {
      title: template?.title || '',
      description: template?.description || '',
      context: template?.context || '',
      module: template?.module || '',
      language: template?.language || 'en',
    },
  });

  const handleLoadDefaultPetitions = () => {
    // Get default petitions based on selected language
    const language = form.getValues('language') as 'en' | 'es' | 'bilingual'
    let defaultText = ''

    if (language === 'bilingual') {
      // For bilingual, combine both English and Spanish
      defaultText = `${DEFAULT_PETITIONS.en}\n\n${DEFAULT_PETITIONS.es}`
    } else {
      // For en or es, use the specific language
      defaultText = DEFAULT_PETITIONS[language] || DEFAULT_PETITIONS.en
    }

    form.setValue('context', defaultText)
    toast.success('Default petition text loaded')
  }

  const onSubmit = async (data: PetitionTemplateFormValues) => {
    setLoading(true);

    try {
      if (template) {
        // Update existing template
        await updatePetitionTemplate({
          id: template.id,
          title: data.title,
          description: data.description,
          context: data.context,
          module: data.module || undefined,
          language: data.language || undefined
        });

        toast.success('Template updated successfully');
        router.push(`/settings/petitions/${template.id}`);
      } else {
        // Create new template
        const newTemplate = await createPetitionTemplate({
          title: data.title,
          description: data.description,
          context: data.context,
          module: data.module || undefined,
          language: data.language || undefined
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormSectionCard title="Template Information">
        <FormInput
          id="title"
          label="Template Title"
          value={form.watch('title')}
          onChange={(value) => form.setValue('title', value)}
          placeholder="e.g., Sunday Mass (English)"
          required
          error={form.formState.errors.title?.message}
        />

        <FormInput
          id="description"
          label="Description"
          value={form.watch('description') || ''}
          onChange={(value) => form.setValue('description', value)}
          placeholder="Brief description of when to use this template"
          error={form.formState.errors.description?.message}
        />

        <FormInput
          id="module"
          label="Module"
          inputType="select"
          value={form.watch('module') || ''}
          onChange={(value) => form.setValue('module', value)}
          options={PETITION_MODULE_VALUES.map(module => ({
            value: module,
            label: PETITION_MODULE_LABELS[module].en
          }))}
          description="Which module should use this template? (Optional)"
          error={form.formState.errors.module?.message}
        />

        <FormInput
          id="language"
          label="Language"
          inputType="select"
          value={form.watch('language')}
          onChange={(value) => form.setValue('language', value)}
          options={PETITION_LANGUAGE_VALUES.map(lang => ({
            value: lang,
            label: PETITION_LANGUAGE_LABELS[lang].en
          }))}
          required
          description="Language of the petition template"
          error={form.formState.errors.language?.message}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Template Text<span className="text-destructive ml-1">*</span>
            </label>
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
          <FormInput
            id="context"
            label=""
            inputType="textarea"
            value={form.watch('context')}
            onChange={(value) => form.setValue('context', value)}
            placeholder="Enter the template text for this template..."
            rows={10}
            required
            description="This is the template text that will be used when creating a new petition with this template. Users can edit it later."
            error={form.formState.errors.context?.message}
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