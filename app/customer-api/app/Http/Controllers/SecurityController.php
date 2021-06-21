<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomersDatas;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;


class SecurityController extends Controller
{
    public function checkLogin() :JsonResponse
    {
        $this->validate($this->request, [
            "email" => "required|string|email",
            "password" => "required|string"
        ]);
        try {
            //check if email exist
            if (!$customer = Customer::where('email', $this->request->email)->first()) {
                return \response()->json(['message' => "Aucun compte associé"], Response::HTTP_BAD_REQUEST);
            }
            //check if password is valide
            if (!Hash::check($this->request->password, $customer->password)) {
                return \response()->json(['message' => "Le mot de passe ne correspond pas"], Response::HTTP_UNAUTHORIZED);
            }
            //password il correct, getting information
            $datas = [
                "email" => $customer->email,
                "userId" => $customer->id,
                "pseudo" => $customer->data->pseudo,
            ];

            return response()->json(["message" => "Connexion reussie", "datas" => $datas], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => "Une erreur est survenue, veuillez réessayer"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

}
