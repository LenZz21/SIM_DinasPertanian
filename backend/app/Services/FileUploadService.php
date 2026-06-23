<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    public function upload(?UploadedFile $file, string $directory = 'uploads'): ?string
    {
        if (! $file) {
            return null;
        }

        return $file->store($directory, 'public');
    }

    public function replace(?UploadedFile $file, ?string $oldPath, string $directory = 'uploads'): ?string
    {
        if (! $file) {
            return $oldPath;
        }

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $this->upload($file, $directory);
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
