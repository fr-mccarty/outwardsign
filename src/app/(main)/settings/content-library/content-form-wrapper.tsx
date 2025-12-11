'use client'

import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ContentForm } from '@/components/content-form'
import { createContent, updateContent } from '@/lib/actions/contents'
import type { ContentWithTags, CreateContentData, UpdateContentData } from '@/lib/types'
import { toast } from 'sonner'

interface ContentFormWrapperProps {
  content?: ContentWithTags
}

export function ContentFormWrapper({ content }: ContentFormWrapperProps) {
  const router = useRouter()
  const isEditing = !!content

  const handleSave = async (data: CreateContentData | UpdateContentData) => {
    try {
      if (isEditing) {
        await updateContent(content.id, data as UpdateContentData)
        toast.success('Content updated successfully')
        router.push(`/settings/content-library/${content.id}`)
      } else {
        const newContent = await createContent(data as CreateContentData)
        toast.success('Content created successfully')
        router.push(`/settings/content-library/${newContent.id}`)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      throw error // Let ContentForm handle the error toast
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      router.push(`/settings/content-library/${content.id}`)
    } else {
      router.push('/settings/content-library')
    }
  }

  return (
    <PageContainer
      title={isEditing ? 'Edit Content' : 'Create Content'}
      description={isEditing ? 'Update liturgical content' : 'Add new liturgical content to your library'}
    >
      <ContentCard>
        <ContentForm
          content={content}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </ContentCard>
    </PageContainer>
  )
}
