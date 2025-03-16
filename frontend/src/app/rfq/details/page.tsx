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
    const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
    const [requirementNotes, setRequirementNotes] = useState<{ [key: number]: string }>({});
    const [modifiedReasons, setModifiedReasons] = useState<Set<number>>(new Set());
    const [editingReasons, setEditingReasons] = useState<Set<number>>(new Set());
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedRequirement, setSelectedRequirement] = useState<number | null>(null);
    const isEditingRef = useRef(false);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [formattedContent, setFormattedContent] = useState<string>("");
    const [viewMode, setViewMode] = useState<'xml' | 'json'>('xml');
    const [selectedLot, setSelectedLot] = useState<any | null>(null);
    const [lotsDialogOpen, setLotsDialogOpen] = useState<boolean>(false);

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

                const ev = await getEvaluation(id!);
                if (!isMounted) return;
                setEvaluation(ev);

                // Set up interval to update evaluation every second
                intervalId = setInterval(async () => {
                    if (!isEditingRef.current) {
                        const updatedEv = await getEvaluation(id!);
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

    const handleRequirementClick = (index: number) => {
        setSelectedRequirement(index);
        setDialogOpen(true);
    };

    // Add this function to format XML
    const formatXML = (xml: string): string => {
        let formatted = '';
        let indent = '';
        
        xml.split(/>\s*</).forEach(function(node) {
            if (node.match(/^\/\w/)) {
                // Decrease indent for closing tag
                indent = indent.substring(2);
            }
            
            formatted += indent + '<' + node + '>\n';
            
            if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith("?")) {
                // Increase indent for opening tag (not self-closing)
                indent += '  ';
            }
        });
        
        return formatted.substring(1, formatted.length - 2);
    };
    
    // Update the dialog content when a requirement is selected
    useEffect(() => {
        if (selectedRequirement !== null && rfq && evaluation) {
            // Check if raw_xml exists
            if (rfq.raw_xml) {
                // Use the raw XML directly
                const formatted = formatXML(rfq.raw_xml);
                setFormattedContent(formatted);
                
                // Apply syntax highlighting after the component renders
                setTimeout(() => {
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block as HTMLElement);
                    });
                }, 0);
            } else {
                // Fallback if raw_xml doesn't exist
                setFormattedContent("No raw XML data available");
            }
        }
    }, [selectedRequirement, rfq, evaluation]);

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
                                                onClick={() => handleRequirementClick(index)}
                                            >
                                                {req.requirement}
                                            </TableCell>
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
                                                                <TableHead>Item</TableHead>
                                                                <TableHead>Description</TableHead>
                                                                <TableHead>Quantity</TableHead>
                                                                <TableHead>Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {lot.requirements.map((requirement, requirementIndex) => (
                                                                <TableRow key={requirementIndex}>
                                                                    <TableCell>{requirement.requirement || `Requirement ${requirementIndex + 1}`}</TableCell>
                                                                    <TableCell className="max-w-[300px]">
                                                                        {requirement.requirement_source || "No description"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setSelectedLot({
                                                                                    lot: lot,
                                                                                    requirement: requirement,
                                                                                    lotIndex: index,
                                                                                    requirementIndex: requirementIndex
                                                                                });
                                                                                setLotsDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            View Details
                                                                        </Button>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Requirement Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedRequirement !== null && rfq && evaluation && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Requirement: {rfq.requirements[selectedRequirement].requirement}
                                </h3>
                                
                                <div className="flex space-x-2 mb-4">
                                    <Button 
                                        variant={viewMode === 'xml' ? 'default' : 'outline'} 
                                        size="sm"
                                        onClick={() => setViewMode('xml')}
                                    >
                                        XML View
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'json' ? 'default' : 'outline'} 
                                        size="sm"
                                        onClick={() => setViewMode('json')}
                                    >
                                        JSON View
                                    </Button>
                                </div>
                                
                                {/* XML View */}
                                {viewMode === 'xml' && (
                                    <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                        {rfq.raw_xml ? (
                                            <pre className="text-sm">
                                                <code className="language-xml">{formattedContent}</code>
                                            </pre>
                                        ) : (
                                            <div className="text-amber-600 p-2 bg-amber-50 rounded">
                                                No raw XML data available for this RFQ
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* JSON View */}
                                {viewMode === 'json' && (
                                    <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                        <pre className="text-sm whitespace-pre-wrap">
                                            {JSON.stringify(
                                                {
                                                    requirement: rfq.requirements[selectedRequirement],
                                                    evaluation: evaluation.requirements_metadata[selectedRequirement],
                                                    rfq: rfq,
                                                },
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={lotsDialogOpen} onOpenChange={setLotsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Lot Item Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedLot && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {selectedLot.item.name || `Item ${selectedLot.itemIndex + 1}`}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700">Lot Information</h4>
                                        <p><span className="font-medium">Title:</span> {selectedLot.lot.title || `Lot ${selectedLot.lotIndex + 1}`}</p>
                                        {selectedLot.lot.description && (
                                            <p><span className="font-medium">Description:</span> {selectedLot.lot.description}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-700">Item Details</h4>
                                        <p><span className="font-medium">Description:</span> {selectedLot.item.description || "No description"}</p>
                                        <p><span className="font-medium">Quantity:</span> {selectedLot.item.quantity || "N/A"}</p>
                                        {selectedLot.item.unit_price && (
                                            <p><span className="font-medium">Unit Price:</span> {selectedLot.item.unit_price}</p>
                                        )}
                                        {selectedLot.item.specifications && (
                                            <div>
                                                <h4 className="font-medium text-gray-700 mt-2">Specifications</h4>
                                                <ul className="list-disc pl-5">
                                                    {Object.entries(selectedLot.item.specifications).map(([key, value], i) => (
                                                        <li key={i}><span className="font-medium">{key}:</span> {String(value)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Additional metadata or actions could go here */}
                                <div className="bg-gray-100 p-4 rounded-md mt-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Raw Data</h4>
                                    <pre className="text-sm whitespace-pre-wrap">
                                        {JSON.stringify(selectedLot.item, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setLotsDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}