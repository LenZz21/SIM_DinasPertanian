<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\SystemNotification;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = auth('api')->id();
        $items = SystemNotification::query()
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereNull('user_id');
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', '%'.$search.'%')
                        ->orWhere('message', 'like', '%'.$search.'%')
                        ->orWhere('type', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('type') && $request->string('type')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('type', $request->string('type'));
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                if ($request->string('status')->toString() === 'Belum Dibaca') {
                    $query->whereNull('read_at');
                }

                if ($request->string('status')->toString() === 'Dibaca') {
                    $query->whereNotNull('read_at');
                }
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        $unreadCount = SystemNotification::query()
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereNull('user_id');
            })
            ->whereNull('read_at')
            ->count();

        return $this->success([
            'items' => NotificationResource::collection($items),
            'unread_count' => $unreadCount,
        ], 'Data notifikasi berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function markAsRead(SystemNotification $notification): JsonResponse
    {
        if ($notification->user_id && $notification->user_id !== auth('api')->id()) {
            return $this->error('Tidak diizinkan mengubah notifikasi ini.', 403);
        }

        $notification->update([
            'read_at' => now(),
        ]);

        return $this->success(new NotificationResource($notification), 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllAsRead(): JsonResponse
    {
        $userId = auth('api')->id();

        SystemNotification::query()
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereNull('user_id');
            })
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success(null, 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function destroy(SystemNotification $notification): JsonResponse
    {
        if ($notification->user_id && $notification->user_id !== auth('api')->id()) {
            return $this->error('Tidak diizinkan menghapus notifikasi ini.', 403);
        }

        if (! $notification->read_at) {
            return $this->error('Notifikasi belum dibaca tidak bisa dihapus.', 422);
        }

        $notification->delete();

        return $this->success(null, 'Notifikasi berhasil dihapus.');
    }
}
