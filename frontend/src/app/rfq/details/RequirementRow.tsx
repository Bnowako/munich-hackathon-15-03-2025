import { TableCell, TableRow } from "@/components/ui/table";
import { Requirement } from "@/lib/apiTypes";
import { useState, KeyboardEvent, ChangeEvent, useRef, useEffect } from "react";

interface RequirementRowProps {
    requirement: Requirement;
    onUpdate: (reason: string) => void;
}

export function RequirementRow({ requirement, onUpdate }: RequirementRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [reason, setReason] = useState(requirement.evaluation.reason || "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialReason, setInitialReason] = useState(reason);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (isEditing) {
            adjustHeight();
        }
    }, [isEditing, reason]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onUpdate(reason);
            setIsEditing(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setReason(e.target.value);
    };

    const startEditing = () => {
        setInitialReason(reason);
        setIsEditing(true);
    };

    const handleBlur = () => {
        setReason(initialReason);
        setIsEditing(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ELIGIBLE": return "✅";
            case "NOT_ELIGIBLE": return "🛑";
            case "IN_PROGRESS": return "🔄";
            case "INITIAL": return "🔵";
            default: return "❓";
        }
    };

    return (
        <TableRow>
            <TableCell className="max-w-[150px]">
                {requirement.requirement}
            </TableCell>
            <TableCell>
                {getStatusIcon(requirement.evaluation.evaluation)}
            </TableCell>
            <TableCell className="max-w-[300px]">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        className="w-full p-2 border rounded resize-none overflow-hidden"
                        value={reason}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        rows={1}
                        autoFocus
                    />
                ) : (
                    <div
                        className="min-h-[2rem] p-2 cursor-pointer hover:bg-gray-50 rounded"
                        onClick={startEditing}
                    >
                        {requirement.evaluation.reason || "No reason provided"}
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
} 