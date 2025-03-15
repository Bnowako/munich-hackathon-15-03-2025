"use client"

import { useEffect, useState } from "react";
import { getEvaluation, getRFQ, requestEvaluation } from "@/lib/api";
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
} from "@/components/ui/table"

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
    const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
    const [requirementNotes, setRequirementNotes] = useState<{ [key: number]: string }>({});
    const [modifiedReasons, setModifiedReasons] = useState<Set<number>>(new Set());
    const [editingReasons, setEditingReasons] = useState<Set<number>>(new Set());
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (!id) return;
        
        (async () => {
            const rfqData = await getRFQ(id);
            setRFQ(rfqData);
            // Initialize empty notes for each requirement
            const ev = await getEvaluation(id);
            setEvaluation(ev);
            const intervalId = setInterval(async () => {
                const updatedEv = await getEvaluation(id);
                setEvaluation(updatedEv);
            }, 5000);
            return () => clearInterval(intervalId);
        })();
    }, [id]);

    const handleNoteChange = (index: number, note: string) => {
        setRequirementNotes(prev => ({
            ...prev,
            [index]: note
        }));
    };

    const handleReasonChange = async (index: number, newReason: string) => {
        if (!evaluation) return;
        
        const originalReason = evaluation.requirements_metadata[index]?.llm_evaluation?.reason || '';
        
        // Track modified state
        if (newReason !== originalReason) {
            setModifiedReasons(prev => new Set(prev).add(index));
        } else {
            setModifiedReasons(prev => {
                const newSet = new Set(prev);
                newSet.delete(index);
                return newSet;
            });
        }

        const updatedMetadata = {
            ...evaluation.requirements_metadata,
            [index]: {
                ...evaluation.requirements_metadata[index],
                llm_evaluation: {
                    ...evaluation.requirements_metadata[index].llm_evaluation,
                    reason: newReason
                }
            }
        };
        
        setEvaluation(prev => prev ? {
            ...prev,
            requirements_metadata: updatedMetadata
        } : null);
    };

    // Reset modified state when new evaluation data comes in
    useEffect(() => {
        setModifiedReasons(new Set());
    }, [id]);

    const requestEvaluationClicked = async () => {
        if (!rfq) return;
        const evaluation = await requestEvaluation(rfq.id);
        console.log(evaluation);
    }

    const startEditing = (index: number) => {
        setEditingReasons(prev => new Set(prev).add(index));
    };

    const stopEditing = (index: number) => {
        setEditingReasons(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    };

    const handleReevaluation = (index: number) => {
        if (!evaluation) return;
        
        const requirementMetadata = evaluation.requirements_metadata[index];
        const updatedReason = requirementMetadata?.llm_evaluation?.reason;
        
        

        console.log('Reevaluating requirement:', {
            index,
            metadata: requirementMetadata,
            updatedReason,
        });
        


        // Clear the modified state for this requirement
        setModifiedReasons(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    };

    const autoResizeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set the height to match the content
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    if (!id) {
        return <div className="container mx-auto p-5">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                No RFQ ID provided
            </div>
        </div>;
    }

    if (!rfq) {
        return <div className="container mx-auto p-5">
            <div className="animate-pulse">Loading...</div>
        </div>;
    }

    return (
        <div className="container mx-auto p-5">
            <div className="mb-4">
                <button 
                    onClick={() => window.history.back()}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Overview
                </button>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6">{rfq.title}</h1>
                
                <div className="grid gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => requestEvaluationClicked()}>Request evaluation</Button>
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
                                            <TableCell className="max-w-[150px]">{req}</TableCell>
                                            
                                            <TableCell>
                                                {(() => {
                                                    const status = evaluation?.requirements_metadata[index]?.llm_evaluation?.evaluation;
                                                    switch(status) {
                                                        case 'ELIGIBLE':
                                                            return '✅';
                                                        case 'NOT_ELIGIBLE':
                                                            return '🛑';
                                                        case 'IN_PROGRESS':
                                                            return (
                                                                <div className="flex items-center">
                                                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                                                    <span className="ml-2">🤖 In progress</span>
                                                                </div>
                                                            );
                                                        default:
                                                            return '🫥';
                                                    }
                                                })()}
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                {editingReasons.has(index) ? (
                                                    <div className="flex flex-col gap-2">
                                                        <textarea
                                                            className="w-full p-2 border rounded resize-none overflow-hidden"
                                                            value={evaluation?.requirements_metadata[index]?.llm_evaluation?.reason || ''}
                                                            onChange={(e) => {
                                                                handleReasonChange(index, e.target.value);
                                                                autoResizeTextArea(e);
                                                            }}
                                                            onFocus={(e) => autoResizeTextArea(e)}
                                                            style={{ height: 'auto' }}
                                                            rows={1}
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => stopEditing(index)}
                                                            >
                                                                Done
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="min-h-[2rem] p-2 cursor-pointer hover:bg-gray-50 rounded"
                                                        onClick={() => startEditing(index)}
                                                    >
                                                        {evaluation?.requirements_metadata[index]?.llm_evaluation?.reason || 'No reason provided'}
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
                                                        evaluation?.requirements_metadata[index]?.llm_evaluation?.evaluation === 'IN_PROGRESS'
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
