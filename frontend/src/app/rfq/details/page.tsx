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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
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
                const rfqData = await getRFQ(id!);
                if (!isMounted) return;
                setRFQ(rfqData);


                // Set up interval to update evaluation every second
                intervalId = setInterval(async () => {
                    if (!isEditingRef.current) {
                        const rfqData = await getRFQ(id!);
                        if (!isMounted) return;
                        setRFQ(rfqData);
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
                                            <TableCell 
                                                className="max-w-[150px] cursor-pointer hover:bg-gray-50"
                                            >
                                                {req.requirement}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const status = rfq.requirements[index].evaluation.evaluation;
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
                                                                rfq.requirements[index].evaluation.reason || ""
                                                            }
                                                            onChange={(e) => {
                                                                autoResizeTextArea(e);
                                                                const newRfq = {...rfq};
                                                                newRfq.requirements[index].evaluation.reason = e.target.value;
                                                                setRFQ(newRfq);
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
                                                        {rfq.requirements[index].evaluation.reason ||
                                                            "No reason provided"}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => console.log("TODO")}
                                                    disabled={
                                                        !modifiedReasons.has(index) ||
                                                        rfq.requirements[index].evaluation.evaluation === "IN_PROGRESS"
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
                
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Lots</h2>
                        <div className="overflow-x-auto">
                            <Accordion type="single" collapsible className="w-full">
                                {rfq.lots.map((lot, index) => (
                                    <AccordionItem key={index} value={`lot-${index}`}>
                                        <AccordionTrigger className="hover:bg-gray-50 px-4">
                                            <div className="flex justify-between w-full">
                                                <span>{lot.title || `Lot ${index + 1}`}</span>
                                                <span className="text-gray-500 text-sm">
                                                    {lot.requirements?.length || 0} items
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-4">
                                                {lot.description && (
                                                    <p className="text-gray-700 mb-4">{lot.description}</p>
                                                )}
                                                
                                                {lot.requirements && lot.requirements.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Requirement</TableHead>
                                                                <TableHead>Evaluation</TableHead>
                                                                <TableHead>Reason</TableHead>
                                                                <TableHead>Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {lot.requirements.map((requirement, requirementIndex) => (
                                                                
                                                                <TableRow key={requirementIndex}>
                                                                    <TableCell>{requirement.requirement  || `Requirement ${requirementIndex + 1}`}</TableCell>
                                                                    <TableCell>
                                                                        {requirement.evaluation.reason || "No description"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {(() => {
                                                                            const status = requirement.evaluation.evaluation;
                                                                            switch (status) {
                                                                                case "ELIGIBLE":
                                                                                    return "✅";
                                                                                case "NOT_ELIGIBLE":
                                                                                    return "🛑";
                                                                                default:
                                                                                    return "🫥";
                                                                            }
                                                                        })()}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                      
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-gray-500 italic">No items in this lot</div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                
                </div>
            </div>
        </div>
    );
}