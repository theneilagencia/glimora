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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const decisors_service_1 = require("./decisors.service");
const create_decisor_dto_1 = require("./dto/create-decisor.dto");
const clerk_auth_guard_1 = require("../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let DecisorsController = class DecisorsController {
    decisorsService;
    constructor(decisorsService) {
        this.decisorsService = decisorsService;
    }
    create(createDecisorDto) {
        return this.decisorsService.create(createDecisorDto);
    }
    findAll(user) {
        return this.decisorsService.findAllByOrganization(user.organizationId);
    }
    getTopDecisors(user, limit) {
        return this.decisorsService.getTopDecisors(user.organizationId, limit ? parseInt(limit, 10) : 10);
    }
    getDecisorsWithRecentActivity(user, days) {
        return this.decisorsService.getDecisorsWithRecentActivity(user.organizationId, days ? parseInt(days, 10) : 7);
    }
    findByAccount(accountId) {
        return this.decisorsService.findAll(accountId);
    }
    findOne(id) {
        return this.decisorsService.findOne(id);
    }
    update(id, updateDto) {
        return this.decisorsService.update(id, updateDto);
    }
    remove(id) {
        return this.decisorsService.remove(id);
    }
};
exports.DecisorsController = DecisorsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new decisor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_decisor_dto_1.CreateDecisorDto]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all decisors in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('top'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top decisors by engagement score' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "getTopDecisors", null);
__decorate([
    (0, common_1.Get)('recent-activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get decisors with recent activity' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "getDecisorsWithRecentActivity", null);
__decorate([
    (0, common_1.Get)('account/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get decisors by account' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "findByAccount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get decisor by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update decisor' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete decisor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecisorsController.prototype, "remove", null);
exports.DecisorsController = DecisorsController = __decorate([
    (0, swagger_1.ApiTags)('decisors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('decisors'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [decisors_service_1.DecisorsService])
], DecisorsController);
//# sourceMappingURL=decisors.controller.js.map