<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerImages;
use App\Models\CustomersDatas;
use App\Models\Matching;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class CustomerController extends Controller
{

    public function __construct(Request $request)
    {
        //construct parent with same request
        parent::__construct($request);
    }

    private function isMatching($gender, $otherAttractedBy)
    {
        if ($gender === 1 && ($otherAttractedBy === 2 || $otherAttractedBy === 1)) {
            return true;
        }
        if ($gender === 0 && ($otherAttractedBy === 2 || $otherAttractedBy === 0)) {
            return true;
        }
        return false;
    }

    public function register(): JsonResponse
    {

        //validate fields
        $this->validate($this->request, [
            'pseudo' => 'required|string|unique:customers_datas',
            'gender' => 'required|integer|min:0|max:1',
            'dateOfBirth' => 'required|date_format:d-m-Y',
            'email' => 'email|max:255|unique:customers|required',
            'password' => 'string|min:8|required',
            'attracted_by' => 'integer|required|min:0|max:2', //0 -> femme / 1 -> homme / 3 -> les deux
        ]);

        //needed variable (created before try catch because of scope)
        $user = null;
        $userData = null;

        try {
            //check if email already exist
            if (Customer::where("email", $this->request->email)->first()) {
                return \response()->json(["message" => "Cet email est deja utilisé"], Response::HTTP_BAD_REQUEST);
            }
            //check if pseudo already exist
            if (CustomersDatas::where("pseudo", $this->request->pseudo)->first()) {
                return \response()->json(["message" => "Ce pseudo est deja utilisé"], Response::HTTP_BAD_REQUEST);
            }
            //Create account
            $user = new Customer();
            $user->email = $this->request->email;
            $user->password = Hash::make($this->request->password);
            $user->blocked = false;
            $user->save();

            //Create account data
            $userData = new CustomersDatas();
            $userData->customer_id = $user->id;
            $userData->pseudo = $this->request->pseudo;
            $userData->gender = $this->request->gender;
            $userData->date_of_birth = strtotime($this->request->dateOfBirth);
            $userData->attracted_by = $this->request->attracted_by;
            $userData->save();

            return response()->json(["message" => "Compte crée."], Response::HTTP_CREATED);
        } catch (Exception $exception) {
            //destroying generated datas
            if ($user) $user->delete();
            if ($userData) $userData->delete();

            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    public function getInformations()
    {

        $this->validate($this->request, [
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            //getting user info
            if (!$user = Customer::where("id", $this->request->jwtInformation["id"])->first()) {
                return response()->json(['message' => "User not found"], Response::HTTP_BAD_REQUEST);
            }
            //getting userdata
            if (!$userData = $user->data) {
                return response()->json(['message' => "User not found"], Response::HTTP_BAD_REQUEST);
            }
            //getting images
            $userImages = $user->images;

            $userInformations = [
                "user" => $user,
            ];
            return response()->json(["message" => "success", "data" => $userInformations], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }


    }

    public function uploadImages()
    {
        $this->validate($this->request, [
            "images" => "array|required",
            'images.*' => 'file|max:2000|mimes:jpeg,png,jpg,gif,svg',
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            //foreaching images and save it on storage
            foreach ($this->request->images as $value) {
                $path = $value->store('images');
                //removing "/image" from path
                $path = str_replace("images/", "", $path);

                //saving in databases
                $image = new CustomerImages();
                $image->customer_id = $this->request->jwtInformation['id'];
                $image->image_uri = $path;
                $image->principal = !CustomerImages::where([
                    ["customer_id", '=', $this->request->jwtInformation['id']],
                    ["principal", "=", true],
                ])->first();
                $image->save();

                $userImages = CustomerImages::where("customer_id", $this->request->jwtInformation['id'])->get();
            }
            return response()->json(["message" => "Images was uploaded", "data" => $userImages], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(['message' => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

    }

    public function deleteImage($imageId)
    {
        $this->validate($this->request, [
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            //getting images from database
            if (!$image = CustomerImages::where("id", $imageId)->first()) {
                return response()->json(['message' => "Image not found"], Response::HTTP_BAD_REQUEST);
            }
            //checking for right
            if ($image->customer_id != $this->request->jwtInformation['id']) {
                return response()->json(['message' => "Unauthorized"], Response::HTTP_UNAUTHORIZED);
            }
            //checking if exist in storage
            if (Storage::exists("images/" . $image->image_uri)) {
                Storage::delete("images/" . $image->image_uri);
            } else {
                return response()->json(['message' => "An error has occurred no file found, please try again"], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            //deleting
            $image = CustomerImages::find($imageId);
            $image->delete();

            //setting new principale if deleted file it was the principale
            if (!CustomerImages::where([ //return true if no principal found
                ["customer_id", '=', $this->request->jwtInformation['id']],
                ["principal", "=", true],
            ])->first()) {
                if ($principal = CustomerImages::where("customer_id", $this->request->jwtInformation['id'])->first()) {
                    $principal->principal = true;
                    $principal->save();
                }
            }
            return response()->json(["message" => 'Your image was deleted'], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(['message' => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function getImage($imageId)
    {
        $this->validate($this->request, [
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            //getting image
            if (!$image = CustomerImages::where("id", $imageId)->first()) {
                return \response()->json(['message' => "No images found"], Response::HTTP_NOT_FOUND);
            }
            //checking right
            if ($image->customer_id != $this->request->jwtInformation['id']) {

                $matches = Matching::where([
                    ["customer_1", $this->request->jwtInformation["id"]],
                    ["customer_2", $image->customer_id]
                ])->orWhere([
                    ["customer_2", $this->request->jwtInformation["id"]],
                    ["customer_1", $image->customer_id]
                ])->first();
                if (!$matches) {
                    return \response()->json(['message' => "Unauthorized"], Response::HTTP_UNAUTHORIZED);
                }
            }

            $image = Storage::response("images/" . $image->image_uri);
            return $image;
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    public function editProfil()
    {
        $this->validate($this->request, [
            'pseudo' => 'string|unique:customers_datas',
            'gender' => 'required|integer|min:0|max:1',
            'dateOfBirth' => 'required|date_format:d-m-Y',
            'attracted_by' => 'integer|required|min:0|max:2', //0 -> femme / 1 -> homme / 3 -> les deux
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            //getting user
            if (!$user = Customer::where("id", $this->request->jwtInformation["id"])->first()) {
                return response()->json(['message' => "No user found"], Response::HTTP_NOT_FOUND);
            }

            if (!$userData = CustomersDatas::where("customer_id", $this->request->jwtInformation["id"])->first()) {
                return response()->json(['message' => "No user found"], Response::HTTP_NOT_FOUND);
            }

            $userData->pseudo = $this->request->pseudo ?? $userData->pseudo;
            $userData->gender = $this->request->gender;
            $userData->date_of_birth = strtotime($this->request->dateOfBirth);
            $userData->attracted_by = $this->request->attracted_by;
            $userData->save();

            //joining data
            $user->data;
            $user->images;

            return response()->json(["message" => 'Your profil was succesfully updated', "data" => $user], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserById($id)
    {
        try {

            if (!$user = Customer::where("id", $id)->first()) {
                return response()->json(['message' => "No user found"], Response::HTTP_NOT_FOUND);
            }
            //joining data
            $user->data;
            $user->images;
            return response()->json(["message" => 'Success', "data" => $user], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserByArray()
    {
        $this->validate($this->request, [
            "idArray" => "required|array",
            "idArray.*" => "required|integer",
        ]);
        try {
            $users = Customer::whereIn("id", $this->request->idArray)->get();
            foreach ($users as $value) {
                $value->data;
                $value->images;
            }
            return response()->json(["message" => 'success', "data" => $users], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function setMatching()
    {
        $this->validate($this->request, [
            "matchings" => "present|array"
        ]);
        try {
            //insert in database
            foreach ($this->request->matchings as $value) {
                $user = Customer::where("id", $value['matched_id'])->first()->data;
                $matchedUser = Customer::where("id", $value['customer_id'])->first()->data;

                $matches = Matching::where([
                    ["customer_1", $value['matched_id']],
                    ["customer_2", $value['customer_id']]
                ])->orWhere([
                    ["customer_2", $value['matched_id']],
                    ["customer_1", $value['customer_id']]
                ])->first();
                if ($matches) {
                    continue;
                }

                $userCheck = $this->isMatching($user->gender, $matchedUser->attracted_by);
                $matchedCheck = $this->isMatching($matchedUser->gender, $user->attracted_by);
                if (!$userCheck || !$matchedCheck) {
                    continue;
                }
                $matching = new Matching();
                $matching->customer_1 = $value['matched_id']; //user principal (sujet du foreach)
                $matching->customer_2 = $value['customer_id'];
                $matching->save();
            }
            return \response()->json(['message' => "success"], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getMatching()
    {
        $this->validate($this->request, [
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
        ]);
        try {
            $matches = Matching::where("customer_1", $this->request->jwtInformation["id"])->orWhere("customer_2", $this->request->jwtInformation["id"])->get();
            $correctMatches = [];
            foreach ($matches as $match) {
                $idSearchBy = $this->request->jwtInformation["id"] === $match->customer_1 ? 'customer_2' : 'customer_1';
                $idTestBy = $this->request->jwtInformation["id"] === $match->customer_1 ? 'customer_1' : 'customer_2';

                if ($match->{$idTestBy . '_decision'} !== null) {
                    continue;
                }
                $user = Customer::where('id', $match->{$idSearchBy})->first();
                $user->data;
                $user->images;
                $match->user = $user;
                $correctMatches[] = $match;
            }
            return response()->json(['message' => "success", "data" => $correctMatches], Response::HTTP_OK);
        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    public function setDecision()
    {
        $this->validate($this->request, [
            "jwtInformation" => "required|array",
            "jwtInformation.id" => "required|integer",
            "matcheId" => "integer|required",
            "decision" => "required|bool"
        ]);
        try {
            //getting match
            if (!$matche = Matching::where("id", $this->request->matcheId)->first()) {
                return response()->json(['message' => "No matche found"], Response::HTTP_NOT_FOUND);
            }

            //lokking for right
            if ($matche->customer_1 != $this->request->jwtInformation['id'] && $matche->customer_2 != $this->request->jwtInformation['id']) {
                return response()->json(['message' => "Unauthorized"], Response::HTTP_UNAUTHORIZED);
            }
            //looking for customer
            $columnToUpdate = ($matche->customer_1 == $this->request->jwtInformation['id']) ? "customer_1_decision" : "customer_2_decision";
            //
            $matche->{$columnToUpdate} = $this->request->decision;

            if ($matche->customer_1_decision == 1 && $matche->customer_2_decision == 1) {
                //sending request to chat to create conversation
                Http::withHeaders([
                    "apiKeyInter" => env("API_KEY_INTER")
                ])->post(config("microservices.chat.conversations"), [
                    "userOneId" => $matche->customer_1,
                    "userTwoId" => $matche->customer_2
                ])->throw();
            }

            $matche->save();

            return response()->json(['message' => "success"], Response::HTTP_OK);
        } catch (\Exception $exception) {
            error_log($exception->getMessage());
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }
}
