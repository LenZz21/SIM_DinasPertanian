<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->userRepository->paginate($request->all());

        return $this->success(UserResource::collection($users), 'Data pengguna berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return DB::transaction(function () use ($payload) {
            $user = $this->userRepository->create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'phone' => $payload['phone'] ?? null,
                'address' => $payload['address'] ?? null,
                'password' => $payload['password'],
                'is_active' => $payload['is_active'] ?? true,
            ]);

            $user->syncRoles([$payload['role']]);
            $this->activityLogService->log('user.create', $user, 'Membuat user baru.');

            return $this->success(new UserResource($user->load('roles')), 'Pengguna berhasil ditambahkan.', 201);
        });
    }

    public function show(User $user): JsonResponse
    {
        return $this->success(new UserResource($user->load('roles')), 'Detail pengguna.');
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $payload = $request->validated();

        return DB::transaction(function () use ($payload, $user) {
            $user = $this->userRepository->update($user, [
                'name' => $payload['name'] ?? $user->name,
                'email' => $payload['email'] ?? $user->email,
                'phone' => $payload['phone'] ?? $user->phone,
                'address' => $payload['address'] ?? $user->address,
                'password' => $payload['password'] ?? $user->password,
                'is_active' => $payload['is_active'] ?? $user->is_active,
            ]);

            if (isset($payload['role'])) {
                $user->syncRoles([$payload['role']]);
            }

            $this->activityLogService->log('user.update', $user, 'Memperbarui data pengguna.');

            return $this->success(new UserResource($user->load('roles')), 'Pengguna berhasil diperbarui.');
        });
    }

    public function destroy(User $user): JsonResponse
    {
        if (auth('api')->id() === $user->id) {
            throw ValidationException::withMessages([
                'user' => 'Akun aktif tidak dapat dihapus.',
            ]);
        }

        $this->userRepository->delete($user);
        $this->activityLogService->log('user.delete', $user, 'Menghapus pengguna.');

        return $this->success(null, 'Pengguna berhasil dihapus.');
    }
}
