import { SignalType, SignalStrength } from '@prisma/client';
export declare class CreateSignalDto {
    type: SignalType;
    strength?: SignalStrength;
    title: string;
    content?: string;
    sourceUrl?: string;
    metadata?: Record<string, unknown>;
    score?: number;
    accountId?: string;
    decisorId?: string;
}
