"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    getRFQ,
    requestEvaluation,
    updateRequirementEvaluation
} from "@/lib/api";
import { RFQResponse } from "@/lib/apiTypes";
import 'highlight.js/styles/github.css';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequirementRow } from "./RequirementRow";

export default function RFQDetailsPage() {
    const [rfq, setRFQ] = useState<RFQResponse | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const onGeneralRequirementUpdate = async (index: number, value: string) => {
        if (!rfq) return;
        console.log("onGeneralRequirementUpdate", index, value);
        const newRfq = { ...rfq };
        newRfq.requirements[index].evaluation.reason = value;
        await updateRequirementEvaluation(id!, index, value);
        setRFQ(newRfq);
    };

    const onLotRequirementUpdate = async (lotIndex: number, reqIndex: number, value: string) => {
        if (!rfq) return;
        console.log("onLotRequirementUpdate", lotIndex, reqIndex, value);
        const newRfq = { ...rfq };
        if (newRfq.lots[lotIndex].requirements) {
            newRfq.lots[lotIndex].requirements![reqIndex].evaluation.reason = value;
        }
        await updateRequirementEvaluation(id!, reqIndex, value, lotIndex);
        setRFQ(newRfq);
    };

    useEffect(() => {
        if (!id || isEditing) return;

        let intervalId: NodeJS.Timeout | null = null;
        let isMounted = true;

        async function fetchData() {
            try {
                const rfqData = await getRFQ(id!);
                if (!isMounted) return;
                setRFQ(rfqData);

                // Set up interval to update evaluation every second
                intervalId = setInterval(async () => {
                    const rfqData = await getRFQ(id!);
                    if (!isMounted) return;
                    setRFQ(rfqData);
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
    }, [id, isEditing]);

    const requestEvaluationClicked = async () => {
        if (!rfq) return;
        const evaluation = await requestEvaluation(rfq.id);
        console.log(evaluation);
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfq.requirements.map((req, index) => (
                                        <RequirementRow
                                            key={index}
                                            requirement={req}
                                            onUpdate={(value) => onGeneralRequirementUpdate(index, value)}
                                            onEditingChange={setIsEditing}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Lots</h2>
                        <div className="overflow-x-auto">
                            <Accordion defaultValue={rfq.lots.map((_, index) => `lot-${index}`)} type="multiple" className="w-full">
                                {rfq.lots.map((lot, index) => (
                                    <AccordionItem  key={index} value={`lot-${index}`}>
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
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                        {lot.requirements.map((req, reqIndex) => (
                                                                <RequirementRow
                                                                    key={reqIndex}
                                                                    requirement={req}
                                                                    onUpdate={(value) => onLotRequirementUpdate(index, reqIndex, value)}
                                                                    onEditingChange={setIsEditing}
                                                                />
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