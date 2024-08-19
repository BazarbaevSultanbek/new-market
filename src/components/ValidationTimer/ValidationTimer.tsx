// validationTimer.tsx
import { useState, useEffect } from 'react';

export const useValidationTimer = (Number: number) => {
    const [countdown, setCountdown] = useState(Number);
    const [resend_status, setResend_status] = useState(false);

    useEffect(() => {
        let interval;
        if (countdown > 0) {
            setResend_status(false);
            interval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else {
            setResend_status(true);
        }

        return () => clearInterval(interval);
    }, [countdown]);

    return { countdown, resend_status, setCountdown };
};
