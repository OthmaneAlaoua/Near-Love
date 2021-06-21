<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            if (!$request->header("Authorization")) {
                return \response()->json(["message" => "Unauthorized"], Response::HTTP_UNAUTHORIZED);
            }
            //checking validity of jwt
            $response = Http::post(config("microservices.auth.check-jwt"),[
                "jwt" => $request->header("Authorization")
            ]);

            if($response->failed()){
                return response()->json(['message' => $response->body()],$response->status());
            }
            //getting information from jwt
            $data = json_decode($response->body(),true)["data"];
            //merging information to request
            $request->merge(["jwtInformation" => $data]);

        } catch (\Exception $exception) {
            return response()->json(["message" => $exception->getMessage()],
                (in_array($exception->getCode(), array_keys(\Illuminate\Http\Response::$statusTexts))) ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return $next($request);
    }
}
