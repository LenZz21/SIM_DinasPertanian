<?php

namespace App\Http\Requests\Harvest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHarvestRequest extends FormRequest
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
            'partner_farmer_id' => ['sometimes', 'required', 'exists:partner_farmers,id'],
            'crop_type' => ['sometimes', 'required', 'string', 'max:120'],
            'harvest_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'harvested_at' => ['sometimes', 'required', 'date'],
            'location' => ['sometimes', 'required', 'string', 'max:190'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
