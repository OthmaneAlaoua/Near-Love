<?php

namespace App\Http\Controllers;

use App\Models\Localisation;
use App\Models\TempLocalisation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\Response;

class LocalisationController extends Controller
{
    public function __construct(Request $request)
    {
        parent::__construct($request);
    }

    public function setLocalisation()
    {
        $this->validate($this->request, [
            "latitude" => "required|string",
            "longitude" => "required|string",
            "altitude" => "required|string",
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        //rollback
        $localisation = null;
        try {
            $localisation = new Localisation();
            $localisation->customer_id = $this->request->jwtInformation['id'];
            $localisation->latitude = $this->request->latitude;
            $localisation->longitude = $this->request->longitude;
            $localisation->altitude = $this->request->altitude;
            $localisation->save();

            return response()->json(["message" => "Success"], Response::HTTP_OK);
        } catch (\Exception $exception) {
            if ($localisation != null) $localisation->delete();
            return response()->json(['message' => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function getLocalisation()
    {
        try {
            $localisations = Localisation::all();
            return \response()->json(['message' => "success", "data" => $localisations]);
        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function getLocalisationByid($id)
    {
        try {
            if (!$localisation = Localisation::where("id", $id)->first()) {
                return \response()->json(['message' => "No localisation found"], Response::HTTP_NOT_FOUND);
            }
            return \response()->json(['message' => "success", "data" => $localisation]);
        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function getLocalisationByUser()
    {
        try {
            $localisations = Localisation::where("customer_id", $this->request->jwtInformation['id'])->get();
            return \response()->json(['message' => "success", "data" => $localisations]);
        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function getNearbyLocalisation()
    {
        try {
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

            if ($response->successful()) {
                //drop temp table
                DB::statement('drop table temp_localisation');
//                remove used rows from real database
//                Localisation::whereIn("id", $toDeleteId)->delete();
            } else {
                //drop temp table
                DB::statement('drop table temp_localisation');
                return response()->json(["message" => "Fail during data sending"],
                    (in_array($response->status(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $response->status() : Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

    }
}
