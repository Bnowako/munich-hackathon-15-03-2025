/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/examples/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Examples */
        get: operations["get_examples_examples__get"];
        put?: never;
        /** Create Example */
        post: operations["create_example_examples__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/examples/{example_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Example */
        get: operations["get_example_examples__example_id__get"];
        /** Update Example */
        put: operations["update_example_examples__example_id__put"];
        post?: never;
        /** Delete Example */
        delete: operations["delete_example_examples__example_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rfq/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Rfqs */
        get: operations["get_rfqs_rfq__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rfq/{rfq_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Rfq */
        get: operations["get_rfq_rfq__rfq_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/evaluation/{rfq_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Evaluation */
        get: operations["get_evaluation_evaluation__rfq_id__get"];
        /** Request Evaluation */
        put: operations["request_evaluation_evaluation__rfq_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/evaluation/{rfq_id}/requirements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update Requirement Evaluation */
        put: operations["update_requirement_evaluation_evaluation__rfq_id__requirements_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/company/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Current Company */
        get: operations["get_current_company_company_current_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/company/{company_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update Company */
        put: operations["update_company_company__company_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Rfqs By Status */
        get: operations["get_rfqs_by_status_dashboard__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Main */
        get: operations["main_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** CompanyResponse */
        CompanyResponse: {
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Facts */
            facts: string[];
        };
        /** CompanyUpdate */
        CompanyUpdate: {
            /** Name */
            name: string;
            /** Facts */
            facts: string[];
        };
        /** EvaluationResponse */
        EvaluationResponse: {
            /** Id */
            id: string;
            /** Rfq Id */
            rfq_id: string;
            /** Requirements Metadata */
            requirements_metadata: components["schemas"]["RequirementMetadataResponse"][];
        };
        /** ExampleResponse */
        ExampleResponse: {
            /** Id */
            id: string;
            /** Name */
            name: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** LotResponse */
        LotResponse: {
            /** Title */
            title: string;
            /** Description */
            description: string;
            /** Requirements */
            requirements: components["schemas"]["RequirementResponse"][];
            /** Lot Source */
            lot_source: string;
        };
        /** PostExampleRequest */
        PostExampleRequest: {
            /** Name */
            name: string;
        };
        /** PutExampleRequest */
        PutExampleRequest: {
            /** Name */
            name: string;
        };
        /** RFQResponse */
        RFQResponse: {
            /** Id */
            id: string;
            /** Title */
            title: string;
            /** Description */
            description: string;
            /** Requirements */
            requirements: components["schemas"]["RequirementResponse"][];
            /** Raw Xml */
            raw_xml: string;
            /** Lots */
            lots: components["schemas"]["LotResponse"][];
        };
        /** RFQStatusResponse */
        RFQStatusResponse: {
            /** Id */
            id: string;
            /** Title */
            title: string;
            /** Status */
            status: string;
        };
        /** RequirementEvaluationResponse */
        RequirementEvaluationResponse: {
            /** Evaluation */
            evaluation?: ("ELIGIBLE" | "NOT_ELIGIBLE" | "UNKNOWN" | "IN_PROGRESS" | "INITIAL") | null;
            /** Reason */
            reason?: string | null;
        };
        /** RequirementMetadataResponse */
        RequirementMetadataResponse: {
            /** Requirement */
            requirement: string;
            evaluation: components["schemas"]["RequirementEvaluationResponse"];
        };
        /** RequirementResponse */
        RequirementResponse: {
            /** Requirement */
            requirement: string;
            /** Requirement Source */
            requirement_source: string;
        };
        /** UpdateRequirementEvaluationRequest */
        UpdateRequirementEvaluationRequest: {
            /** Requirement */
            requirement: string;
            /** Updated Reason */
            updated_reason: string;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_examples_examples__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExampleResponse"][];
                };
            };
        };
    };
    create_example_examples__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostExampleRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExampleResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_example_examples__example_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                example_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExampleResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_example_examples__example_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                example_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PutExampleRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExampleResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_example_examples__example_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                example_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_rfqs_rfq__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RFQResponse"][];
                };
            };
        };
    };
    get_rfq_rfq__rfq_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rfq_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RFQResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_evaluation_evaluation__rfq_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rfq_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvaluationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_evaluation_evaluation__rfq_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rfq_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_requirement_evaluation_evaluation__rfq_id__requirements_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rfq_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateRequirementEvaluationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_current_company_company_current_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompanyResponse"];
                };
            };
        };
    };
    update_company_company__company_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                company_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompanyUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompanyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_rfqs_by_status_dashboard__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RFQStatusResponse"][];
                };
            };
        };
    };
    main_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
}
