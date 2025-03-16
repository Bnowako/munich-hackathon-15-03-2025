import { toast } from "sonner";
import createClient from "openapi-fetch";
import { paths } from "./types";
import { ExampleResponse, PostExampleRequest, PutExampleRequest, RFQResponse, EvaluationResponse, CompanyResponse, CompanyUpdate, UpdateRequirementEvaluationRequest, RFQStatusResponse } from "./apiTypes";

const client = createClient<paths>({baseUrl: '/api'});


export const handleApiError = (error: unknown) => {  
    // @ts-expect-error hack to handle error
    const message = error?.message || 'An unexpected error occurred'; 
    toast.error(message);
    throw error;
};

export async function getExamples(): Promise<ExampleResponse[]> {
    const { data, error } = await client.GET("/examples/");
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as ExampleResponse[];
};

export async function getExample(exampleId: string): Promise<ExampleResponse> {
    const { data, error } = await client.GET("/examples/{example_id}", {params: {path: {example_id: exampleId}}});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as ExampleResponse;
};
  
export async function createExample(example: PostExampleRequest): Promise<ExampleResponse> {
    const { data, error } = await client.POST("/examples/", {body: example});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as ExampleResponse;
};

export async function updateExample(exampleId: string, example: PutExampleRequest): Promise<ExampleResponse> {
    const { data, error } = await client.PUT("/examples/{example_id}", {params: {path: {example_id: exampleId}}, body: example});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as ExampleResponse;
};

export async function deleteExample(exampleId: string): Promise<void> {
    const { error } = await client.DELETE("/examples/{example_id}", {params: {path: {example_id: exampleId}}});
    if (error) handleApiError(error);
};
export async function getRFQs(): Promise<RFQResponse[]> {
    const { data, error } = await client.GET("/rfq/");
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as RFQResponse[];
}

export async function getRFQ(id: string): Promise<RFQResponse> {
    const { data, error } = await client.GET("/rfq/{rfq_id}", {params: {path: {rfq_id: id}}});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as RFQResponse;
}


export async function getEvaluation(id: string): Promise<EvaluationResponse> {
    const { data, error } = await client.GET("/evaluation/{rfq_id}", {params: {path: {rfq_id: id}}});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as EvaluationResponse;
}

export async function requestEvaluation(id: string): Promise<EvaluationResponse> {
    const { data, error } = await client.PUT("/evaluation/{rfq_id}", {params: {path: {rfq_id: id}}});
    if (error) handleApiError(error);
    return data as EvaluationResponse;
}



export async function getCompany(id: string): Promise<CompanyResponse> {
    const { data, error } = await client.GET("/company/{company_id}", {params: {path: {company_id: id}}});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as CompanyResponse;
}

export async function updateCompany(id: string, company: CompanyUpdate): Promise<CompanyResponse> {
    const { data, error } = await client.PUT("/company/{company_id}", {params: {path: {company_id: id}}, body: company});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as CompanyResponse;
}

export async function updateCompanyWithRunningText(id: string, runningText: string): Promise<CompanyResponse> {
    const { data, error } = await client.POST("/company/{company_id}/running-text", {params: {path: {company_id: id}}, body: {running_text: runningText}});
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as CompanyResponse;
}

export async function getCurrentCompany(): Promise<CompanyResponse> {
    const { data, error } = await client.GET("/company/current");
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as CompanyResponse;
}

export async function updateRequirementEvaluation(id: string, requirementIndex: number, updatedReason: string, lotIndex: number | null = null): Promise<EvaluationResponse> {
    const { data, error } = await client.PUT("/evaluation/{rfq_id}/requirements", {params: {path: {rfq_id: id}}, body: {requirement_index: requirementIndex, updated_reason: updatedReason, lot_index: lotIndex}});
    if (error) handleApiError(error);
    return data as EvaluationResponse;
}



export async function getRFQsByStatus(): Promise<RFQStatusResponse[]> {
    const { data, error } = await client.GET("/dashboard/");
    if (error) handleApiError(error);
    if (!data) throw new Error("No data returned");
    return data as RFQStatusResponse[];
}