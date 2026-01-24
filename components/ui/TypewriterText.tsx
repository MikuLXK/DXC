
import React, { useState, useEffect } from 'react';

export const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        let index = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else { clearInterval(timer); }
        }, 15);
        return () => clearInterval(timer);
    }, [text]);
    return <>{displayedText}</>;
};
