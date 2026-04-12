"use client"
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export function UploadZone() {
    const onDrop = useCallback((_acceptedFiles: File[]) => {
        // Logique d'upload
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'image/*': ['.png', '.jpg', '.jpeg']
        }
    })

    return (
        <div
            {...getRootProps()}
            className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
      `}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Déposez les fichiers ici...</p>
            ) : (
                <div>
                    <p>Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner</p>
                    <p className="text-sm text-gray-500 mt-2">
                        PDF, Word, Images (max. 50MB)
                    </p>
                </div>
            )}
        </div>
    )
}