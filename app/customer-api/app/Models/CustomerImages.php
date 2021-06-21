<?php


namespace App\Models;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int gender
 * @property int age
 * @property string pseudo
 * @property string customer_id
 *
 */
class CustomerImages extends Model {
    protected $guarded = ['id'];
    protected $table = "customers_images";
}
