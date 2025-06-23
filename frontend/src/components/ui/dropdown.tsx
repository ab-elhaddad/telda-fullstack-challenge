import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: number;
  className?: string;
}

export function Dropdown({ 
  trigger, 
  children, 
  align = "left", 
  width = 200,
  className 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      
      // Calculate position based on trigger element
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const top = rect.bottom + window.scrollY;
        
        let left = align === "left" ? rect.left : rect.right - width;
        
        // Ensure dropdown doesn't go off screen on the right
        const rightEdge = left + width;
        if (rightEdge > window.innerWidth) {
          left = window.innerWidth - width - 10;
        }
        
        // Ensure dropdown doesn't go off screen on the left
        if (left < 0) {
          left = 10;
        }
        
        setPosition({ top, left });
      }
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, align, width]);

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={toggleDropdown}>
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className={cn(
            "fixed z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${width}px`,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}

export function DropdownItem({ 
  children,
  onClick,
  className
}: { 
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
