<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomersDatasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers_datas', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('customer_id');
            $table->string('pseudo')->unique();
            $table->integer('gender')->default(0);
            $table->string('date_of_birth');
            $table->integer('attracted_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customers_datas');
    }
}
