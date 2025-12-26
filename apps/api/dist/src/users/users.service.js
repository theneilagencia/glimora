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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        return this.prisma.user.create({
            data: createUserDto,
            include: {
                organization: true,
            },
        });
    }
    async findAll(organizationId) {
        return this.prisma.user.findMany({
            where: { organizationId },
            include: {
                organization: true,
                assignedAccounts: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                organization: true,
                assignedAccounts: true,
                actions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByClerkId(clerkId) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
            include: {
                organization: true,
                assignedAccounts: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with Clerk ID ${clerkId} not found`);
        }
        return user;
    }
    async updateRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
    async remove(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async syncFromClerk(clerkId, email, firstName, lastName, avatarUrl) {
        return this.prisma.user.upsert({
            where: { clerkId },
            update: {
                email,
                firstName,
                lastName,
                avatarUrl,
            },
            create: {
                clerkId,
                email,
                firstName,
                lastName,
                avatarUrl,
                organization: {
                    create: {
                        name: `${firstName || 'User'}'s Organization`,
                        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            include: {
                organization: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map