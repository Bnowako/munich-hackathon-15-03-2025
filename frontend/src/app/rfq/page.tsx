"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getRFQs } from "@/lib/api";
import { RFQResponse } from "@/lib/apiTypes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OverviewPage() {
    const router = useRouter();
    const [data, setData] = useState<RFQResponse[]>([]);
    const [columns] = useState<{ header: string, accessorKey: string }[]>([
        
        { header: "Title", accessorKey: "title" },
        // Add any other columns you want to display
    ]);

    useEffect(() => {
        (async () => {
            const rfqData = await getRFQs();
            setData(rfqData);
        })();
    }, []);

    const onRowClicked = (data: RFQResponse) => {
        router.push(`/rfq/details?id=${data.id}`);
    }

    const onDeleteClicked = (data: RFQResponse) => {
        // TODO: Implement delete functionality
        console.log("Delete clicked for:", data.id);
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold my-5">RFQs</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.accessorKey}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow
                                key={row.id}
                                className="cursor-pointer"
                                onClick={() => onRowClicked(row)}
                            >
                                {columns.map((column) => (
                                    <TableCell key={`${row.id}-${column.accessorKey}`}>
                                        {row[column.accessorKey as keyof RFQResponse]?.toString() || ''}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
