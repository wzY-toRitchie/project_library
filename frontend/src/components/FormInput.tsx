import React from 'react';

interface FormInputProps {
    label?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon,
    required = false,
    error,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-xl">{icon}</span>
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border ${
                        error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default FormInput;
