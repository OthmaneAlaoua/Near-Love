<?php

namespace App\Console;

use App\Models\Localisation;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Lumen\Console\Kernel as ConsoleKernel;
use Symfony\Component\HttpFoundation\Response;
use function Symfony\Component\Translation\t;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            try {
                error_log("Start script");
                //creating temporary table
                $temp_table = DB::unprepared('CREATE TEMPORARY TABLE IF NOT EXISTS temp_localisation SELECT * FROM localisation;');

                //getting all entry
                $localisationsTemp = DB::select('select * from temp_localisation');

                //setting radius
                $distance = 0.001;

                //matching array && toDeleteArray
                $matchings = [];
                $toDeleteId = [];
                //foreaching entry
                foreach ($localisationsTemp as $key => $item) {

                    $localisation = app('db')->select("SELECT * FROM(
            SELECT *, (
                (
                    (acos(sin((? * pi() / 180))
                        *
                        sin((`latitude` * pi() / 180)) + cos((? * pi() / 180))
                        *
                        cos((`latitude` * pi() / 180)) * cos(((? - `longitude`) * pi() / 180)))
                    ) * 180 / pi()
                ) * 60 * 1.1515 * 1.609344
             ) as distance FROM temp_localisation" . ")" . "temp_localisation WHERE distance <= ?  AND customer_id != ? AND created_at > DATE_ADD(?, INTERVAL -3 SECOND) AND created_at < DATE_ADD(?, INTERVAL +3 SECOND)  LIMIT ?;", [$item->latitude, $item->latitude, $item->longitude, $distance, $item->customer_id, $item->created_at, $item->created_at, 20]);
                    if (!empty($localisation)) {
                        foreach ($localisation as $value) {
                            $value->matched_id = $item->customer_id;
                        }
                        array_push($matchings, ...$localisation);
                    }
                    array_push($toDeleteId, $item->id);
                    //deleting used rows
                    DB::delete("delete from temp_localisation where id = ?", [$item->id]);
                }

                //sending datas to customer_api
                $response = HTTP::withHeaders([
                    "apiKeyInter" => env("API_KEY_INTER")
                ])->post(config("microservices.customer.matching"), [
                    "matchings" => $matchings
                ]);
                error_log($response->body());
                if ($response->successful()) {
                    //drop temp table
                    DB::statement('drop table temp_localisation');
//                remove used rows from real database
                    error_log("Remove database row");

                    Localisation::whereIn("id", $toDeleteId)->delete();
                } else {
                    //drop temp table
                    DB::statement('drop table temp_localisation');
                }
                error_log("Fin");
            } catch (\Exception $exception) {
                error_log($exception->getMessage());
            }
        })->everyMinute();
    }
}
