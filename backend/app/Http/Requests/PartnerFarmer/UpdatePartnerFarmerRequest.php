<?php

namespace App\Http\Requests\PartnerFarmer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePartnerFarmerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'address' => ['sometimes', 'required', 'string'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'region' => ['sometimes', 'required', 'string', 'max:120'],
            'plant_type' => ['sometimes', 'required', 'string', 'max:120'],
        ];
    }
}
