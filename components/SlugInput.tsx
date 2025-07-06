"use client";

interface SlugInputProps {
    placeholder?: string;
    className?: string;
    register?: any;
}

export default function SlugInput({
    placeholder,
    className,
    register
}: SlugInputProps) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                className || ""
            }`}
            {...(register || {})}
        />
    );
}
