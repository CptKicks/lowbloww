export interface MessageData {
    from: string;
    body: string;
    isGroup: boolean;
    groupName?: string;
    timestamp: number;
}

export interface OpenAIResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
