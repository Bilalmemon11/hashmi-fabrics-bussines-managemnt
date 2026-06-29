<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPayment extends Model
{
    use HasFactory;

    protected $fillable = ['vendor_id', 'amount', 'date', 'notes'];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
