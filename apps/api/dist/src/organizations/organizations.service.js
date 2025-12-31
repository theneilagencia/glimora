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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganizationsService = class OrganizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrganizationDto) {
        return this.prisma.organization.create({
            data: {
                ...createOrganizationDto,
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async findOne(id) {
        const organization = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                users: true,
                accounts: {
                    take: 10,
                    orderBy: { signalScore: 'desc' },
                },
            },
        });
        if (!organization) {
            throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }
    async update(id, data) {
        return this.prisma.organization.update({
            where: { id },
            data,
        });
    }
    async getStats(id) {
        const [accountCount, userCount, signalCount, actionCount] = await Promise.all([
            this.prisma.account.count({ where: { organizationId: id } }),
            this.prisma.user.count({ where: { organizationId: id } }),
            this.prisma.signal.count({
                where: { account: { organizationId: id } },
            }),
            this.prisma.action.count({
                where: { account: { organizationId: id } },
            }),
        ]);
        return {
            accountCount,
            userCount,
            signalCount,
            actionCount,
        };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map