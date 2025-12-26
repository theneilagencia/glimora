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
exports.PressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const press_service_1 = require("./press.service");
const create_press_release_dto_1 = require("./dto/create-press-release.dto");
const clerk_auth_guard_1 = require("../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PressController = class PressController {
    pressService;
    constructor(pressService) {
        this.pressService = pressService;
    }
    create(user, createDto) {
        return this.pressService.create(user.organizationId, createDto);
    }
    generate(user, generateDto) {
        return this.pressService.generate(user.organizationId, generateDto);
    }
    findAll(user, templateType, status, limit) {
        return this.pressService.findAll(user.organizationId, {
            templateType,
            status,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getStats(user) {
        return this.pressService.getStats(user.organizationId);
    }
    findOne(id) {
        return this.pressService.findOne(id);
    }
    update(id, updateDto) {
        return this.pressService.update(id, updateDto);
    }
    remove(id) {
        return this.pressService.remove(id);
    }
};
exports.PressController = PressController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new press release' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_press_release_dto_1.CreatePressReleaseDto]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a press release from template' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_press_release_dto_1.GeneratePressReleaseDto]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all press releases' }),
    (0, swagger_1.ApiQuery)({ name: 'templateType', required: false, enum: client_1.PressTemplateType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('templateType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get press release statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get press release by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update press release' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC),
    (0, swagger_1.ApiOperation)({ summary: 'Delete press release' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PressController.prototype, "remove", null);
exports.PressController = PressController = __decorate([
    (0, swagger_1.ApiTags)('press'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('press'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [press_service_1.PressService])
], PressController);
//# sourceMappingURL=press.controller.js.map