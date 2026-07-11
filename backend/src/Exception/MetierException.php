<?php

namespace App\Exception;

class MetierException extends \RuntimeException
{
    public function __construct(
        string $message = '',
        private int $httpStatus = 400,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }
}
