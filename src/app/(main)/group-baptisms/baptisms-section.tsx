"use client"

import { useState } from 'react'
import { addBaptismToGroup, removeBaptismFromGroup } from '@/lib/actions/group-baptisms'
import type { GroupBaptismWithRelations } from '@/lib/actions/group-baptisms'
import { ListCard, CardListItem } from '@/components/list-card'
import { BaptismPicker } from '@/components/baptism-picker'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BaptismsSectionProps {
  groupBaptism: GroupBaptismWithRelations
}

export function BaptismsSection({ groupBaptism }: BaptismsSectionProps) {
  const router = useRouter()
  const [showBaptismPicker, setShowBaptismPicker] = useState(false)

  const handleAddExistingBaptism = async (baptismId: string) => {
    try {
      await addBaptismToGroup(groupBaptism.id, baptismId)
      toast.success('Baptism added to group')
      router.refresh()
      setShowBaptismPicker(false)
    } catch (error: any) {
      console.error('Failed to add baptism:', error)
      toast.error(error.message || 'Failed to add baptism to group')
    }
  }

  const handleRemoveBaptism = async (baptismId: string) => {
    try {
      await removeBaptismFromGroup(baptismId)
      toast.success('Baptism removed from group')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to remove baptism:', error)
      toast.error(error.message || 'Failed to remove baptism from group')
    }
  }

  return (
    <>
      <div data-testid="group-baptisms-list">
        <ListCard
          title="Baptisms in This Group"
          description={`${groupBaptism.baptisms?.length || 0} ${groupBaptism.baptisms?.length === 1 ? 'baptism' : 'baptisms'} in this group ceremony`}
          items={groupBaptism.baptisms || []}
          getItemId={(baptism) => baptism.id}
          onAdd={() => setShowBaptismPicker(true)}
          addButtonLabel="Add Baptism"
          emptyMessage="No baptisms in this group yet. Click 'Add Baptism' to add an existing baptism."
          renderItem={(baptism) => {
          const childName = baptism.child?.full_name || 'No child assigned'
          const parents = [baptism.mother?.full_name, baptism.father?.full_name]
            .filter(Boolean)
            .join(' and ') || 'No parents assigned'
          const sponsors = [baptism.sponsor_1?.full_name, baptism.sponsor_2?.full_name]
            .filter(Boolean)
            .join(' and ') || 'No godparents assigned'

          return (
            <CardListItem
              id={baptism.id}
              onDelete={() => handleRemoveBaptism(baptism.id)}
              deleteConfirmTitle="Remove Baptism from Group?"
              deleteConfirmDescription={`Are you sure you want to remove ${childName} from this group baptism? The individual baptism record will remain in the system and can be re-added to this or another group later.`}
              deleteActionLabel="Remove from Group"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/baptisms/${baptism.id}`}
                  className="font-semibold hover:underline"
                >
                  {childName}
                </Link>
                <div className="text-sm text-muted-foreground">
                  <div><span className="font-medium">Parents:</span> {parents}</div>
                  <div><span className="font-medium">Godparents:</span> {sponsors}</div>
                </div>
              </div>
            </CardListItem>
          )
        }}
        />
      </div>

      {/* Baptism Picker Dialog */}
      <BaptismPicker
        open={showBaptismPicker}
        onOpenChange={setShowBaptismPicker}
        onSelect={handleAddExistingBaptism}
      />
    </>
  )
}
