"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useId } from "react";

type Props = {
  label?: string;
  name?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  placeholder?: string;
  setValue: (value: string) => void;
  initialValue?: string;
  clearable?: boolean;
  className?: string;
};

function Input({
  label,
  name,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  value,
  setValue,
  clearable = false,
  className,
}: Props) {
  const inputId = useId();

  return (
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-sm text-dimmed" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          value={value}
          name={name}
          onChange={(e) => setValue(e.target.value)}
          type={type}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`${className} p-2 pr-8 h-10 placeholder:text-midnight-500 text-ellipsis rounded-md border border-midnight-700 bg-transparent enabled:hover:bg-midnight-800 focus:outline-none focus:ring-4 ring-indigo-500/60 focus:border-opacity-0 w-full transition-colors disabled:opacity-70`}
        />
        {clearable && (
          <button
            className={`p-2 absolute right-0 inset-y-0 hover:text-red-400 transition-opacity opacity-0 focus:outline-none ${
              value ? "group-hover:opacity-100" : ""
            }`}
            onClick={() => setValue("")}
            type="button"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Input;
