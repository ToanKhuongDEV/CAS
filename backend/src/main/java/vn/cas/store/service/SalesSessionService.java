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
import vn.cas.store.model.SalesSessionResolution;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.model.SalesSessionResolution.ResolutionStatus;

@Service
public class SalesSessionService {
    private static final String ANONYMOUS_CUSTOMER_NAME = "Khách lẻ";

    private final DiningTableMapper diningTableMapper;
    private final AuditLogService auditLogService;

    public SalesSessionService(DiningTableMapper diningTableMapper,
            AuditLogService auditLogService) {
        this.diningTableMapper = diningTableMapper;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SalesSessionResolution resolveQr(SalesSessionResolutionCommand command) {
        var salesSession = diningTableMapper
                .findSalesSessionByActiveQrTokenForUpdate(command.qrToken());
        if (salesSession == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.INVALID_TABLE_QR_CODE);
        }

        if (salesSession.sessionPublicId() != null) {
            return new SalesSessionResolution(
                    ResolutionStatus.valueOf(salesSession.sessionStatus()),
                    salesSession.sessionPublicId(), salesSession.tableCode());
        }

        if (command.customerName() == null || command.customerName().isBlank()) {
            return new SalesSessionResolution(ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED, null,
                    salesSession.tableCode());
        }

        long clientAccountId = findOrCreateClientAccount(salesSession.storeId(), command);
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenDineInSalesSession(salesSession.tableId(), sessionPublicId,
                clientAccountId, command.customerName(), command.customerPhone());
        return new SalesSessionResolution(ResolutionStatus.OPEN, sessionPublicId,
                salesSession.tableCode());
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
                salesSession.sessionPublicId(), salesSession.tableCode());
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
        if (current.sessionPublicId() != null) {
            if (!"OPEN".equals(current.sessionStatus())) {
                throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
            }
            return current;
        }
        if (customerName == null || customerName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        }
        long clientAccountId = findOrCreateClientAccount(storeId,
                new SalesSessionResolutionCommand(null, customerName, customerPhone));
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenDineInSalesSession(tableId, sessionPublicId, clientAccountId,
                customerName, customerPhone);
        return new SalesSessionLookup(0L, tableId, storeId, current.tableCode(), 0L, null, null,
                sessionPublicId, "OPEN", "DINE_IN");
    }

    @Transactional
    public SalesSessionLookup openTakeawayForOperator(long storeId) {
        long clientAccountId = findOrCreateClientAccount(storeId,
                new SalesSessionResolutionCommand(null, ANONYMOUS_CUSTOMER_NAME, null));
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenTakeawaySalesSession(storeId, sessionPublicId, clientAccountId,
                ANONYMOUS_CUSTOMER_NAME);
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
