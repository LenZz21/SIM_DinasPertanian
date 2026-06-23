<?php

namespace App\Services;

use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    public function notifyUser(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        array $meta = []
    ): SystemNotification {
        return SystemNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'meta' => $meta,
        ]);
    }

    public function notifyRoles(
        array $roles,
        string $title,
        string $message,
        string $type = 'info',
        array $meta = []
    ): void {
        $users = User::query()->role($roles)->get();

        $users->each(function (User $user) use ($title, $message, $type, $meta) {
            $this->notifyUser($user, $title, $message, $type, $meta);
        });
    }

    public function latestForUser(int $userId, int $limit = 20): Collection
    {
        return SystemNotification::query()
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereNull('user_id');
            })
            ->latest()
            ->limit($limit)
            ->get();
    }
}
