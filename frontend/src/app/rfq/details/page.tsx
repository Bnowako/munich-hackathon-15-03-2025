"use client";

import { useEffect, useState, useRef } from "react";
import {
    getEvaluation,
    getRFQ,
    requestEvaluation,
    updateRequirementEvaluation,
} from "@/lib/api";
import { EvaluationResponse, RFQResponse } from "@/lib/apiTypes";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
    const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
    const [requirementNotes, setRequirementNotes] = useState<{ [key: number]: string }>({});
    const [modifiedReasons, setModifiedReasons] = useState<Set<number>>(new Set());
    const [editingReasons, setEditingReasons] = useState<Set<number>>(new Set());
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const isEditingRef = useRef(false);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Sync isEditing with ref
    useEffect(() => {
        isEditingRef.current = isEditing;
    }, [isEditing]);

    useEffect(() => {
        if (!id) return;

        let intervalId: NodeJS.Timeout | null = null;
        let isMounted = true;

        async function fetchData() {
            try {
                const rfqData = await getRFQ(id);
                if (!isMounted) return;
                setRFQ(rfqData);

                const ev = await getEvaluation(id);
                if (!isMounted) return;
                setEvaluation(ev);

                // Set up interval to update evaluation every second
                intervalId = setInterval(async () => {
                    if (!isEditingRef.current) {
                        const updatedEv = await getEvaluation(id);
                        if (!isMounted) return;
                        setEvaluation(updatedEv);
                    }
                }, 1000);
            } catch (error) {
                console.error("Error fetching RFQ data:", error);
            }
        }

        fetchData();

        // Cleanup function to clear the interval when the component unmounts
        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [id]);

    const handleNoteChange = (index: number, note: string) => {
        setRequirementNotes((prev) => ({
            ...prev,
            [index]: note,
        }));
    };

    const handleReasonChange = async (index: number, newReason: string) => {
        if (!evaluation) return;

        const originalReason = evaluation.requirements_metadata[index]?.evaluation?.reason || "";

        // Track modified state
        if (newReason !== originalReason) {
            setModifiedReasons((prev) => new Set(prev).add(index));
        } else {
            setModifiedReasons((prev) => {
                const newSet = new Set(prev);
                newSet.delete(index);
                return newSet;
            });
        }

        const updatedMetadata = {
            ...evaluation.requirements_metadata,
            [index]: {
                ...evaluation.requirements_metadata[index],
                evaluation: {
                    ...evaluation.requirements_metadata[index].evaluation,
                    reason: newReason,
                },
            },
        };

        setEvaluation((prev) =>
            prev
                ? {
                    ...prev,
                    requirements_metadata: updatedMetadata,
                }
                : null
        );
    };

    // Reset modified state when new evaluation data comes in
    useEffect(() => {
        setModifiedReasons(new Set());
    }, [id]);

    const requestEvaluationClicked = async () => {
        if (!rfq) return;
        const evaluation = await requestEvaluation(rfq.id);
        console.log(evaluation);
    };

    const startEditing = (index: number) => {
        // Switch to editing the new textarea
        setEditingReasons(new Set([index]));
        setIsEditing(true);
    };

    const stopEditing = () => {
        setEditingReasons(new Set());
        setIsEditing(false);
    };

    const handleReevaluation = async (index: number) => {
        if (!evaluation || !rfq) return;

        const requirementMetadata = evaluation.requirements_metadata[index];
        const updatedReason = requirementMetadata?.evaluation?.reason;
        if (!updatedReason || updatedReason === "") return;

        console.log("Reevaluating requirement:", {
            index,
            metadata: requirementMetadata,
            updatedReason,
        });

        const updatedEvaluation = await updateRequirementEvaluation(rfq.id, {
            requirement: requirementMetadata.requirement,
            updated_reason: updatedReason,
        });

        // Clear the modified state for this requirement
        setModifiedReasons((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });

        // Close all textareas and exit editing mode
        setEditingReasons(new Set());
        setIsEditing(false);
    };

    const autoResizeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        // Set the height to match the content
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    if (!id) {
        return (
            <div className="container mx-auto p-5">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    No RFQ ID provided
                </div>
            </div>
        );
    }

    if (!rfq) {
        return (
            <div className="container mx-auto p-5">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-5">
            <div className="mb-4">
                <Link href="/rfq" className="text-blue-600 hover:text-blue-800">
                    ← Back to Overview
                </Link>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6">{rfq.title}</h1>

                <div className="grid gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={requestEvaluationClicked}>Request evaluation</Button>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="max-w-[300px]">Requirement</TableHead>
                                        <TableHead>Evaluation</TableHead>
                                        <TableHead className="max-w-[300px]">Reason</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfq.requirements.map((req, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="max-w-[150px]">{req.requirement}</TableCell>

                                            <TableCell>
                                                {(() => {
                                                    const status = evaluation?.requirements_metadata[index]?.evaluation?.evaluation;
                                                    switch (status) {
                                                        case "ELIGIBLE":
                                                            return "✅";
                                                        case "NOT_ELIGIBLE":
                                                            return "🛑";
                                                        case "IN_PROGRESS":
                                                            return (
                                                                <div className="flex items-center">
                                                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                                                    <span className="ml-2">🤖 In progress</span>
                                                                </div>
                                                            );
                                                        case "INITIAL":
                                                            return "🫎";
                                                        default:
                                                            return "🫥";
                                                    }
                                                })()}
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                {editingReasons.has(index) ? (
                                                    <div className="flex flex-col gap-2">
                                                        <textarea
                                                            className="w-full p-2 border rounded resize-none overflow-hidden"
                                                            value={
                                                                evaluation?.requirements_metadata[index]?.evaluation?.reason || ""
                                                            }
                                                            onChange={(e) => {
                                                                handleReasonChange(index, e.target.value);
                                                                autoResizeTextArea(e);
                                                            }}
                                                            onFocus={(e) => autoResizeTextArea(e)}
                                                            style={{ height: "auto" }}
                                                            rows={1}
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="min-h-[2rem] p-2 cursor-pointer hover:bg-gray-50 rounded"
                                                        onClick={() => startEditing(index)}
                                                    >
                                                        {evaluation?.requirements_metadata[index]?.evaluation?.reason ||
                                                            "No reason provided"}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReevaluation(index)}
                                                    disabled={
                                                        !modifiedReasons.has(index) ||
                                                        evaluation?.requirements_metadata[index]?.evaluation?.evaluation === "IN_PROGRESS"
                                                    }
                                                >
                                                    Reevaluate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}