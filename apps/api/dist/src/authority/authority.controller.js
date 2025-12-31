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
exports.AuthorityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const authority_service_1 = require("./authority.service");
const create_authority_content_dto_1 = require("./dto/create-authority-content.dto");
const clerk_auth_guard_1 = require("../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AuthorityController = class AuthorityController {
    authorityService;
    constructor(authorityService) {
        this.authorityService = authorityService;
    }
    create(user, createDto) {
        return this.authorityService.create(user.organizationId, createDto);
    }
    findAll(user, topics, limit) {
        return this.authorityService.findAll(user.organizationId, {
            topics: topics ? topics.split(',') : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getTopContent(user, limit) {
        return this.authorityService.getTopContent(user.organizationId, limit ? parseInt(limit, 10) : 10);
    }
    getAllTopics(user) {
        return this.authorityService.getAllTopics(user.organizationId);
    }
    getStats(user) {
        return this.authorityService.getStats(user.organizationId);
    }
    matchToSignal(user, topics) {
        return this.authorityService.matchContentToSignal(user.organizationId, topics.split(','));
    }
    findOne(id) {
        return this.authorityService.findOne(id);
    }
    update(id, updateDto) {
        return this.authorityService.update(id, updateDto);
    }
    remove(id) {
        return this.authorityService.remove(id);
    }
};
exports.AuthorityController = AuthorityController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create new authority content' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_authority_content_dto_1.CreateAuthorityContentDto]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all authority content' }),
    (0, swagger_1.ApiQuery)({
        name: 'topics',
        required: false,
        type: String,
        description: 'Comma-separated topics',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('topics')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('top'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top authority content by engagement' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "getTopContent", null);
__decorate([
    (0, common_1.Get)('topics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all topics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "getAllTopics", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get authority content statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('match'),
    (0, swagger_1.ApiOperation)({ summary: 'Match content to signal topics' }),
    (0, swagger_1.ApiQuery)({
        name: 'topics',
        required: true,
        type: String,
        description: 'Comma-separated topics',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('topics')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "matchToSignal", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get authority content by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update authority content' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC),
    (0, swagger_1.ApiOperation)({ summary: 'Delete authority content' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthorityController.prototype, "remove", null);
exports.AuthorityController = AuthorityController = __decorate([
    (0, swagger_1.ApiTags)('authority'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('authority'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [authority_service_1.AuthorityService])
], AuthorityController);
//# sourceMappingURL=authority.controller.js.map