<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


/**
 * @property integer id
 * @property boolean blocked
 * @property string password
 * @property string email
 */
class Customer extends Model {
    protected $guarded = ['id'];
    protected $hidden = ['password','blocked',"created_at","updated_at"];

    public function data()
    {
        return $this->hasOne(CustomersDatas::class,"customer_id","id");
    }

    public function images()
    {
        return $this->hasMany(CustomerImages::class,"customer_id","id");
    }
}
