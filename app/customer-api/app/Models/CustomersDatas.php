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
class CustomersDatas extends Model {
    protected $guarded = ['id'];
    protected $hidden = ["created_at","updated_at"];

    public function customer()
    {
        return $this->hasOne(Customer::class,"id","customer_id");
    }

}
