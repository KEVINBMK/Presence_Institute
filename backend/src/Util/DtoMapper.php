<?php

namespace App\Util;

use Symfony\Component\HttpFoundation\Request;

final class DtoMapper
{
    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T
     */
    public static function map(Request $request, string $class): object
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            throw new \InvalidArgumentException('Corps JSON invalide.');
        }

        $dto = new $class();
        foreach ($data as $key => $value) {
            if (property_exists($dto, $key)) {
                $dto->$key = $value;
            }
        }

        return $dto;
    }
}
