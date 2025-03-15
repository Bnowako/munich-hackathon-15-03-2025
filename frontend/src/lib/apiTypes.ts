import { components } from "./types";


export type ExampleResponse = components["schemas"]["ExampleResponse"]
export type PostExampleRequest = components["schemas"]["PostExampleRequest"]
export type PutExampleRequest = components["schemas"]["PutExampleRequest"]
export type RFQResponse = components["schemas"]["RFQResponse"]

export type EvaluationResponse = components["schemas"]["EvaluationResponse"]
export type UpdateRequirementEvaluationRequest = components["schemas"]["UpdateRequirementEvaluationRequest"]
export type RequirementMetadataResponse = components["schemas"]["RequirementMetadataResponse"]
export type RequirementEvaluationResponse = components["schemas"]["RequirementEvaluationResponse"]
export type CompanyResponse = components["schemas"]["CompanyResponse"]
export type CompanyUpdate = components["schemas"]["CompanyUpdate"]
export type RFQStatusResponse = components["schemas"]["RFQStatusResponse"]

    export type BaseMessage = {
    type: "human" | "ai" | "tool",
    content: string,
    conversation_id: string,
    tool_calls?: {
        name: string,
        args: Record<string, unknown>,
    }[],
}
