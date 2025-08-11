'use client';

import { useState, useRef } from 'react';
import { 
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onImagesChange([...images, result]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ürün Resimleri ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Resim Ekle
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <img
              src={image}
              alt={`Ürün resmi ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

            {/* Main image indicator */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md">
                Ana Resim
              </div>
            )}
          </div>
        ))}

        {/* Add image placeholder */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="aspect-square bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
          >
            <PhotoIcon className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Resim Ekle</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-500">
        <p>• En fazla {maxImages} resim yükleyebilirsiniz</p>
        <p>• İlk resim ana resim olarak kullanılır</p>
        <p>• Desteklenen formatlar: JPG, PNG, GIF</p>
        <p>• Önerilen boyut: 800x800px veya daha yüksek</p>
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-600">Yükleniyor...</span>
        </div>
      )}
    </div>
  );
} 