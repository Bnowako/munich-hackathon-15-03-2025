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

    const requestEvaluationClicked = async () => {
        if (!rfq) return;
        const evaluation = await requestEvaluation(rfq.id);
        console.log(evaluation);
    }

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
                                        <TableHead>Requirement</TableHead>
                                        <TableHead>Evaluation</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfq.requirements.map((req, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{req}</TableCell>
                                            
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
                                            <TableCell>
                                                {evaluation?.requirements_metadata[index]?.llm_evaluation?.reason || 'No reason provided'}
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
