<?php

namespace App\Http\Controllers;

use DateTimeImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Lcobucci\Clock\FrozenClock;
use Lcobucci\Clock\SystemClock;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Validation\Constraint\LooseValidAt;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\Constraint\StrictValidAt;
use Mockery\Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Lcobucci\Clock\Clock;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Configuration;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public function getJwt(Request $request): Response
    {

        $this->validate($request, [
            "email" => "string|email|required",
            "password" => "string|required",
        ]);

        try {
            //checking if credential are ok
            $response = Http::post(config("microservices.customer.url.login"), $request->all());

            if ($response->status() != Response::HTTP_OK) {
                return response()->json(["message" => json_decode($response->body(), true)["message"]], $response->status());
            }
            //getting needed information
            $userInformation = json_decode($response->body(), true)["datas"];

            //start by configure the jwt
            $configuration = Configuration::forSymmetricSigner(
                new Sha256(),
                InMemory::plainText(base64_encode(env("JWT_SECRET")))
            );

            $time = new DateTimeImmutable();

            $jwt = $configuration->builder()->issuedBy('168_auth')
                ->issuedAt($time)
                ->expiresAt($time->modify("+ 5 hour"))
                ->withClaim('userId', $userInformation['userId'])
                ->withClaim('email', $userInformation['email'])
                ->withClaim('pseudo', $userInformation['pseudo'])
                ->getToken($configuration->signer(), $configuration->signingKey());

            //adding jwt to datas
            $userInformation['jwt'] = $jwt->toString();

            return response()->json(['message' => "Authentification reussi", "datas" => $userInformation], Response::HTTP_OK);

        } catch (Exception $exception) {
            return response()->json(["message" => "Une erreur est survenue, veuillez réessayer"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function checkJwt(Request $request): JsonResponse
    {
        $this->validate($request, [
            "jwt" => "required|string"
        ]);

        try {
            $configuration = Configuration::forSymmetricSigner(
                new Sha256(),
                InMemory::plainText(base64_encode(env("JWT_SECRET")))
            );
            $token = $configuration->parser()->parse($request->jwt);
            $configuration->setValidationConstraints(
                new SignedWith(new Sha256(), InMemory::plainText(base64_encode(env("JWT_SECRET")))),
                new LooseValidAt(new FrozenClock(new DateTimeImmutable()))
            );
            $constraints = $configuration->validationConstraints();

            if (!$configuration->validator()->validate($token, ...$constraints)) {
                return response()->json("This jwt is not valid", Response::HTTP_UNAUTHORIZED);
            }
            //getting information fron jwt
            $token = $configuration->parser()->parse($request->jwt);
            $jwtUserInformations = [
                "id" =>  $token->claims()->get("userId"),
                "email" =>  $token->claims()->get("email"),
                "pseudo" => $token->claims()->get("pseudo"),
                "expiration" => $token->claims()->get("exp"),
            ];

            return response()->json(["message" => "This jwt is valid", "data" => $jwtUserInformations], Response::HTTP_OK);

        } catch (Exception $exception) {
            return response()->json(["mess" => "An error has occurred, please try again"],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
