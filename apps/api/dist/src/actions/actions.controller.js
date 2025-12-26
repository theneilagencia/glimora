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
exports.ActionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const actions_service_1 = require("./actions.service");
const create_action_dto_1 = require("./dto/create-action.dto");
const clerk_auth_guard_1 = require("../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let ActionsController = class ActionsController {
    actionsService;
    constructor(actionsService) {
        this.actionsService = actionsService;
    }
    create(createActionDto) {
        return this.actionsService.create(createActionDto);
    }
    generateFromSignal(signalId) {
        return this.actionsService.generateActionsFromSignal(signalId);
    }
    findAll(user, status, limit) {
        return this.actionsService.findAll(user.organizationId, {
            status,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getPendingActions(user) {
        return this.actionsService.getPendingActions(user.id);
    }
    getStats(user) {
        return this.actionsService.getActionStats(user.organizationId);
    }
    findOne(id) {
        return this.actionsService.findOne(id);
    }
    update(id, updateDto) {
        return this.actionsService.update(id, updateDto);
    }
    updateStatus(id, status) {
        return this.actionsService.updateStatus(id, status);
    }
    remove(id) {
        return this.actionsService.remove(id);
    }
};
exports.ActionsController = ActionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new action' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_action_dto_1.CreateActionDto]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generate/:signalId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate actions from a signal' }),
    __param(0, (0, common_1.Param)('signalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "generateFromSignal", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all actions' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.ActionStatus }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending actions for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "getPendingActions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get action statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get action by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update action' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update action status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete action' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "remove", null);
exports.ActionsController = ActionsController = __decorate([
    (0, swagger_1.ApiTags)('actions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('actions'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [actions_service_1.ActionsService])
], ActionsController);
//# sourceMappingURL=actions.controller.js.map