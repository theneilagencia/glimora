import { PressTemplateType } from '@prisma/client';
export declare class CreatePressReleaseDto {
    title: string;
    content: string;
    templateType: PressTemplateType;
    status?: string;
    signalContext?: Record<string, unknown>;
}
export declare class GeneratePressReleaseDto {
    templateType: PressTemplateType;
    signalId?: string;
    topic?: string;
    companyName?: string;
    ceoName?: string;
    productName?: string;
    partnerName?: string;
}
