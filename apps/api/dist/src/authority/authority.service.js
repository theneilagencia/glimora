"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthorityService = class AuthorityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, createDto) {
        return this.prisma.authorityContent.create({
            data: {
                ...createDto,
                publishedAt: createDto.publishedAt
                    ? new Date(createDto.publishedAt)
                    : undefined,
                organizationId,
            },
        });
    }
    async findAll(organizationId, options) {
        const where = { organizationId };
        if (options?.topics && options.topics.length > 0) {
            where.topics = { hasSome: options.topics };
        }
        return this.prisma.authorityContent.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            take: options?.limit,
        });
    }
    async findOne(id) {
        const content = await this.prisma.authorityContent.findUnique({
            where: { id },
            include: {
                actions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException(`Authority content with ID ${id} not found`);
        }
        return content;
    }
    async update(id, updateDto) {
        return this.prisma.authorityContent.update({
            where: { id },
            data: {
                ...updateDto,
                publishedAt: updateDto.publishedAt
                    ? new Date(updateDto.publishedAt)
                    : undefined,
            },
        });
    }
    async remove(id) {
        return this.prisma.authorityContent.delete({
            where: { id },
        });
    }
    async findByTopics(organizationId, topics) {
        return this.prisma.authorityContent.findMany({
            where: {
                organizationId,
                topics: { hasSome: topics },
            },
            orderBy: { engagementCount: 'desc' },
        });
    }
    async getTopContent(organizationId, limit = 10) {
        return this.prisma.authorityContent.findMany({
            where: { organizationId },
            orderBy: { engagementCount: 'desc' },
            take: limit,
        });
    }
    async matchContentToSignal(organizationId, signalTopics) {
        const matchedContent = await this.prisma.authorityContent.findMany({
            where: {
                organizationId,
                topics: { hasSome: signalTopics },
            },
            orderBy: { engagementCount: 'desc' },
            take: 5,
        });
        return matchedContent.map((content) => ({
            ...content,
            relevanceScore: this.calculateRelevanceScore(content.topics, signalTopics),
        }));
    }
    calculateRelevanceScore(contentTopics, signalTopics) {
        const matchingTopics = contentTopics.filter((topic) => signalTopics.some((st) => st.toLowerCase().includes(topic.toLowerCase()) ||
            topic.toLowerCase().includes(st.toLowerCase())));
        return Math.round((matchingTopics.length /
            Math.max(contentTopics.length, signalTopics.length)) *
            100);
    }
    async getAllTopics(organizationId) {
        const contents = await this.prisma.authorityContent.findMany({
            where: { organizationId },
            select: { topics: true },
        });
        const allTopics = contents.flatMap((c) => c.topics);
        const uniqueTopics = [...new Set(allTopics)];
        return uniqueTopics.sort();
    }
    async getStats(organizationId) {
        const [total, topTopics, recentContent] = await Promise.all([
            this.prisma.authorityContent.count({ where: { organizationId } }),
            this.getAllTopics(organizationId),
            this.prisma.authorityContent.count({
                where: {
                    organizationId,
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);
        return {
            total,
            topTopics: topTopics.slice(0, 10),
            recentMonth: recentContent,
        };
    }
};
exports.AuthorityService = AuthorityService;
exports.AuthorityService = AuthorityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthorityService);
//# sourceMappingURL=authority.service.js.map