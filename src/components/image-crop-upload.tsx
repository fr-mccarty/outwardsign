'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  PERSON_PHOTO_MAX_FILE_SIZE,
  PERSON_PHOTO_ALLOWED_TYPES,
  PERSON_PHOTO_TARGET_WIDTH,
  PERSON_PHOTO_TARGET_HEIGHT,
} from '@/lib/constants'

interface ImageCropUploadProps {
  currentImageUrl?: string | null
  onImageCropped: (base64Data: string, extension: string) => Promise<void>
  onImageRemoved?: () => Promise<void>
  label?: string
  description?: string
  disabled?: boolean
  aspectRatio?: number
  targetWidth?: number
  targetHeight?: number
  fallbackInitials?: string
  maxFileSize?: number
}

// Create image from canvas with cropped area
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  targetWidth: number,
  targetHeight: number
): Promise<{ base64: string; extension: string }> {
  const image = new Image()
  image.crossOrigin = 'anonymous'

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Draw cropped image to canvas at target size
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
      )

      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.9)
      resolve({ base64, extension: 'jpg' })
    }

    image.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    image.src = imageSrc
  })
}

export function ImageCropUpload({
  currentImageUrl,
  onImageCropped,
  onImageRemoved,
  label = 'Profile Photo',
  description,
  disabled = false,
  aspectRatio = 1,
  targetWidth = PERSON_PHOTO_TARGET_WIDTH,
  targetHeight = PERSON_PHOTO_TARGET_HEIGHT,
  fallbackInitials = '?',
  maxFileSize = PERSON_PHOTO_MAX_FILE_SIZE,
}: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be selected again
    e.target.value = ''

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
      toast.error(`File size must be under ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!PERSON_PHOTO_ALLOWED_TYPES.includes(file.type as typeof PERSON_PHOTO_ALLOWED_TYPES[number])) {
      toast.error('Only JPEG, PNG, and WebP images are supported')
      return
    }

    // Read file and open crop modal
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setIsCropModalOpen(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsDataURL(file)
  }, [maxFileSize])

  const handleCropSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      setIsUploading(true)
      const { base64, extension } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        targetWidth,
        targetHeight
      )
      await onImageCropped(base64, extension)
      setIsCropModalOpen(false)
      setImageSrc(null)
    } catch (error) {
      console.error('Failed to crop image:', error)
      toast.error('Failed to process image')
    } finally {
      setIsUploading(false)
    }
  }, [imageSrc, croppedAreaPixels, targetWidth, targetHeight, onImageCropped])

  const handleCropCancel = useCallback(() => {
    setIsCropModalOpen(false)
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  const handleRemove = useCallback(async () => {
    if (!onImageRemoved) return

    try {
      setIsRemoving(true)
      await onImageRemoved()
    } catch (error) {
      console.error('Failed to remove image:', error)
      toast.error('Failed to remove photo')
    } finally {
      setIsRemoving(false)
    }
  }, [onImageRemoved])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <Avatar className="h-20 w-20">
          {currentImageUrl ? (
            <AvatarImage src={currentImageUrl} alt="Profile photo" />
          ) : null}
          <AvatarFallback className="text-lg">{fallbackInitials}</AvatarFallback>
        </Avatar>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading || isRemoving}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={disabled || isUploading || isRemoving}
          >
            <Upload className="h-4 w-4 mr-2" />
            {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {currentImageUrl && onImageRemoved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading || isRemoving}
              className="text-destructive hover:text-destructive"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Remove Photo
            </Button>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Photo</DialogTitle>
          </DialogHeader>

          <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <Label htmlFor="zoom" className="text-sm whitespace-nowrap">
              Zoom
            </Label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCropCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropSave}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
