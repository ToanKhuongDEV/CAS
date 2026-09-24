package vn.cas.store.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.dto.CreateClientAccountCommand;
import vn.cas.store.dto.SalesSessionResolutionCommand;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.model.SalesSessionResolution;
import vn.cas.store.model.SalesSessionResolution.ResolutionStatus;

@Service
public class SalesSessionService {
    private final DiningTableMapper diningTableMapper;
    private final AuditLogService auditLogService;

    public SalesSessionService(DiningTableMapper diningTableMapper,
            AuditLogService auditLogService) {
        this.diningTableMapper = diningTableMapper;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SalesSessionResolution resolveQr(SalesSessionResolutionCommand command) {
        var table = diningTableMapper.findTableByActiveQrTokenForUpdate(command.qrToken());
        if (table == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.INVALID_TABLE_QR_CODE);
        }
        var joinableSessions = diningTableMapper
                .findJoinableDineInSessionsByTableId(table.tableId());

        if (command.joinSessionPublicId() != null) {
            var joined = joinableSessions.stream().filter(
                    session -> session.sessionPublicId().equals(command.joinSessionPublicId()))
                    .findFirst().orElseThrow(() -> new ApiException(HttpStatus.CONFLICT,
                            "Phiên bàn được chọn không còn hoạt động."));
            return new SalesSessionResolution(ResolutionStatus.valueOf(joined.sessionStatus()),
                    joined.sessionPublicId(), table.tableCode(), java.util.List.of());
        }

        if (command.customerName() == null || command.customerName().isBlank()) {
            if (!joinableSessions.isEmpty()) {
                return new SalesSessionResolution(ResolutionStatus.JOIN_SESSION_REQUIRED, null,
                        table.tableCode(), joinableSessions);
            }
            return new SalesSessionResolution(ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED, null,
                    table.tableCode(), java.util.List.of());
        }

        String sessionType = command.sessionType() == null ? "DINE_IN" : command.sessionType();
        if (!"DINE_IN".equals(sessionType) && !"TAKEAWAY".equals(sessionType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        }
        if ("TAKEAWAY".equals(sessionType)
                && (command.customerPhone() == null || command.customerPhone().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        }

        long clientAccountId = findOrCreateClientAccount(table.storeId(), command);
        String sessionPublicId = UUID.randomUUID().toString();
        if ("TAKEAWAY".equals(sessionType)) {
            diningTableMapper.insertOpenTakeawaySalesSession(table.storeId(), sessionPublicId,
                    clientAccountId, command.customerName(), command.customerPhone());
        } else {
            diningTableMapper.insertOpenDineInSalesSession(table.tableId(), sessionPublicId,
                    clientAccountId, command.customerName(), command.customerPhone());
        }
        return new SalesSessionResolution(ResolutionStatus.OPEN, sessionPublicId, table.tableCode(),
                java.util.List.of());
    }

    @Transactional(readOnly = true)
    public SalesSessionResolution getCurrent(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        }

        var salesSession = diningTableMapper.findCurrentSalesSessionByPublicId(sessionPublicId);
        if (salesSession == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        }

        return new SalesSessionResolution(ResolutionStatus.valueOf(salesSession.sessionStatus()),
                salesSession.sessionPublicId(), salesSession.tableCode(), java.util.List.of());
    }

    @Transactional(readOnly = true)
    public long getCurrentStoreId(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        }
        var session = diningTableMapper.findCurrentSalesSessionByPublicId(sessionPublicId);
        if (session == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        }
        return session.storeId();
    }

    @Transactional(readOnly = true)
    public SalesSessionLookup requireCurrent(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank())
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        var session = diningTableMapper.findCurrentSalesSessionByPublicId(sessionPublicId);
        if (session == null)
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        return session;
    }

    public SalesSessionLookup requireCurrentForUpdate(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank())
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        var session = diningTableMapper.findCurrentSalesSessionByPublicIdForUpdate(sessionPublicId);
        if (session == null)
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_SALES_SESSION_REQUIRED);
        return session;
    }

    @Transactional(readOnly = true)
    public java.util.List<vn.cas.store.model.OperatorTableSession> findActiveDineInSessions(
            long storeId) {
        return diningTableMapper.findActiveDineInSessionsByStoreId(storeId);
    }

    @Transactional
    public void cancelCurrent(String sessionPublicId) {
        var session = requireCurrentForUpdate(sessionPublicId);
        if (!"OPEN".equals(session.sessionStatus())
                || diningTableMapper.hasOrders(session.sessionId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.CUSTOMER_SALES_SESSION_CANNOT_BE_CANCELLED);
        }
        if (diningTableMapper.closeSessionWithoutOrders(session.sessionId()) != 1) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.CUSTOMER_SALES_SESSION_CANNOT_BE_CANCELLED);
        }
    }

    @Transactional
    public void cancelForOperator(OperationalPrincipal principal, String sessionPublicId,
            UUID requestId) {
        var session = requireCurrentForUpdate(sessionPublicId);
        if (session.storeId() != principal.storeId()) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.DINING_TABLE_NOT_FOUND);
        }
        if (!"OPEN".equals(session.sessionStatus())
                || diningTableMapper.hasOrders(session.sessionId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.OPERATOR_SALES_SESSION_CANNOT_BE_CANCELLED);
        }
        if (diningTableMapper.closeSessionWithoutOrders(session.sessionId()) != 1) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.OPERATOR_SALES_SESSION_CANNOT_BE_CANCELLED);
        }
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CANCEL",
                "SALES_SESSION", session.sessionId(), session.sessionPublicId(),
                "{\"tableCode\":" + session.tableCode() + "}", principal.accountId(),
                principal.displayName(), "Cancelled an open sales session without orders"));
    }

    @Transactional
    public SalesSessionLookup openOrGetForOperator(long storeId, long tableId, String customerName,
            String customerPhone) {
        var current = diningTableMapper.findSalesSessionByStoreIdAndTableIdForUpdate(storeId,
                tableId);
        if (current == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.DINING_TABLE_NOT_FOUND);
        }
        if (customerName == null || customerName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        }
        long clientAccountId = findOrCreateClientAccount(storeId,
                new SalesSessionResolutionCommand(null, customerName, customerPhone, null, null));
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenDineInSalesSession(tableId, sessionPublicId, clientAccountId,
                customerName, customerPhone);
        return new SalesSessionLookup(0L, tableId, storeId, current.tableCode(), 0L, null, null,
                sessionPublicId, "OPEN", "DINE_IN");
    }

    @Transactional
    public SalesSessionLookup openTakeawayForOperator(long storeId, String customerName,
            String customerPhone) {
        long clientAccountId = findOrCreateClientAccount(storeId,
                new SalesSessionResolutionCommand(null, customerName, customerPhone, null, null));
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenTakeawaySalesSession(storeId, sessionPublicId, clientAccountId,
                customerName, customerPhone);
        return requireCurrentForUpdate(sessionPublicId);
    }

    private long findOrCreateClientAccount(long storeId, SalesSessionResolutionCommand command) {
        if (command.customerPhone() != null) {
            Long existingId = diningTableMapper.findClientAccountIdByStoreIdAndPhone(storeId,
                    command.customerPhone());
            if (existingId != null) {
                return existingId;
            }
        }

        var createCommand = new CreateClientAccountCommand(storeId, command.customerName(),
                command.customerPhone());
        diningTableMapper.insertClientAccount(createCommand);
        return createCommand.getId();
    }
}
