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
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jobs_service_1 = require("./jobs.service");
const clerk_auth_guard_1 = require("../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    scheduleSignalCollection(user, accountId) {
        return this.jobsService.scheduleSignalCollection(user.organizationId, accountId);
    }
    scheduleWeeklyCollection(user) {
        return this.jobsService.scheduleWeeklyCollection(user.organizationId);
    }
    getJobLogs(jobName, status, limit) {
        return this.jobsService.getJobLogs({
            jobName,
            status,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getJobStats() {
        return this.jobsService.getJobStats();
    }
    getQueueStatus() {
        return this.jobsService.getQueueStatus();
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)('collect-signals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger signal collection job' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "scheduleSignalCollection", null);
__decorate([
    (0, common_1.Post)('schedule-weekly'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule weekly signal collection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "scheduleWeeklyCollection", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get job logs' }),
    (0, swagger_1.ApiQuery)({ name: 'jobName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('jobName')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getJobLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get job statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getJobStats", null);
__decorate([
    (0, common_1.Get)('queue-status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.EXEC, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get queue status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getQueueStatus", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)('jobs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('jobs'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map