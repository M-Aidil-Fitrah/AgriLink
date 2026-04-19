'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AnimatedInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    delay?: number;
    icon?: LucideIcon;
    showPasswordToggle?: boolean;
    onChange?: (value: string) => void;
}

export const AnimatedInput = ({
    label,
    name,
    type = 'text',
    placeholder,
    required = false,
    defaultValue,
    delay = 0,
    showPasswordToggle = false,
    onChange
}: AnimatedInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [value, setValue] = useState(defaultValue || '');

    const inputType = showPasswordToggle ? (isVisible ? 'text' : 'password') : type;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-1 relative"
        >
            <motion.label
                animate={{ color: isFocused ? '#16a34a' : '#9ca3af' }}
                className="block text-[10px] font-bold uppercase tracking-[0.18em]"
            >
                {label}
            </motion.label>
            
            <div className="relative">
                <input
                    name={name}
                    type={inputType}
                    value={value}
                    required={required}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (onChange) onChange(e.target.value);
                    }}
                    className="w-full bg-transparent border-b-2 border-[#e5e7eb] py-2.5 text-[15px] text-stone-900 placeholder:text-stone-300 outline-none transition-colors duration-300"
                    style={{ borderBottomColor: isFocused ? '#16a34a' : '#e5e7eb' }}
                />
                
                {/* Focus indicator overlay */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-600 rounded-full origin-left"
                />

                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors"
                    >
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export const HeadingWord = ({ word, delay, isGreen = false }: { word: string; delay: number; isGreen?: boolean }) => {
    return (
        <div className="overflow-hidden inline-block mr-[0.2em]">
            <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
                className={`inline-block ${isGreen ? 'text-green-400' : 'text-white'}`}
            >
                {word}
            </motion.span>
        </div>
    );
};

export const PasswordStrength = ({ password }: { password: string }) => {
    const getStrength = (pw: string) => {
        if (!pw) return { score: 0, label: '', color: 'bg-stone-200' };
        if (pw.length < 6) return { score: 1, label: 'Lemah', color: 'bg-red-400' };
        
        const hasNumber = /\d/.test(pw);
        const hasUpper = /[A-Z]/.test(pw);
        
        if (pw.length < 10 || !hasNumber) return { score: 2, label: 'Cukup', color: 'bg-amber-400' };
        if (!hasUpper) return { score: 3, label: 'Kuat', color: 'bg-green-400' };
        
        return { score: 4, label: 'Sangat Kuat', color: 'bg-green-600' };
    };

    const { score, label, color } = getStrength(password);

    return (
        <div className="space-y-1.5 mt-1.5">
            <div className="flex gap-1.5 h-1">
                {[1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i <= score ? 1 : 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`h-full flex-1 rounded-full origin-left transition-colors duration-300 ${i <= score ? color : 'bg-stone-100'}`}
                    />
                ))}
            </div>
            {label && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-[11px] font-bold ${color.replace('bg-', 'text-')}`}
                >
                    {label}
                </motion.p>
            )}
        </div>
    );
};
