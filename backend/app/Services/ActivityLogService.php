<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    public function log(
        string $action,
        ?Model $subject = null,
        ?string $description = null,
        array $metadata = []
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
