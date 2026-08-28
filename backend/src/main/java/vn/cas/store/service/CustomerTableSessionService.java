package vn.cas.store.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.store.dto.CreateClientAccountCommand;
import vn.cas.store.dto.CustomerTableSessionResolutionCommand;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.CustomerTableSessionResolution;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.model.CustomerTableSessionResolution.ResolutionStatus;

@Service
public class CustomerTableSessionService {

    private final DiningTableMapper diningTableMapper;

    public CustomerTableSessionService(DiningTableMapper diningTableMapper) {
        this.diningTableMapper = diningTableMapper;
    }

    @Transactional
    public CustomerTableSessionResolution resolveQr(CustomerTableSessionResolutionCommand command) {
        var tableSession = diningTableMapper
                .findTableSessionByActiveQrTokenForUpdate(command.qrToken());
        if (tableSession == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.INVALID_TABLE_QR_CODE);
        }

        if (tableSession.sessionPublicId() != null) {
            return new CustomerTableSessionResolution(
                    ResolutionStatus.valueOf(tableSession.sessionStatus()),
                    tableSession.sessionPublicId(), tableSession.tableCode());
        }

        if (command.customerName() == null || command.customerName().isBlank()) {
            return new CustomerTableSessionResolution(
                    ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED, null, tableSession.tableCode());
        }

        long clientAccountId = findOrCreateClientAccount(tableSession.storeId(), command);
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenCustomerTableSession(tableSession.tableId(), sessionPublicId,
                clientAccountId, command.customerName(), command.customerPhone());
        return new CustomerTableSessionResolution(ResolutionStatus.OPEN, sessionPublicId,
                tableSession.tableCode());
    }

    @Transactional(readOnly = true)
    public CustomerTableSessionResolution getCurrent(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        }

        var tableSession = diningTableMapper.findCurrentTableSessionByPublicId(sessionPublicId);
        if (tableSession == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        }

        return new CustomerTableSessionResolution(
                ResolutionStatus.valueOf(tableSession.sessionStatus()),
                tableSession.sessionPublicId(), tableSession.tableCode());
    }

    @Transactional(readOnly = true)
    public long getCurrentStoreId(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        }
        var session = diningTableMapper.findCurrentTableSessionByPublicId(sessionPublicId);
        if (session == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        }
        return session.storeId();
    }

    @Transactional(readOnly = true)
    public CustomerTableSessionLookup requireCurrent(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank())
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        var session = diningTableMapper.findCurrentTableSessionByPublicId(sessionPublicId);
        if (session == null)
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        return session;
    }

    public CustomerTableSessionLookup requireCurrentForUpdate(String sessionPublicId) {
        if (sessionPublicId == null || sessionPublicId.isBlank())
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        var session = diningTableMapper.findCurrentTableSessionByPublicIdForUpdate(sessionPublicId);
        if (session == null)
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    ApiMessages.CUSTOMER_TABLE_SESSION_REQUIRED);
        return session;
    }

    @Transactional
    public void cancelCurrent(String sessionPublicId) {
        var session = requireCurrentForUpdate(sessionPublicId);
        if (!"OPEN".equals(session.sessionStatus())
                || diningTableMapper.hasOrders(session.sessionId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.CUSTOMER_TABLE_SESSION_CANNOT_BE_CANCELLED);
        }
        if (diningTableMapper.closeSessionWithoutOrders(session.sessionId()) != 1) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.CUSTOMER_TABLE_SESSION_CANNOT_BE_CANCELLED);
        }
    }

    @Transactional
    public CustomerTableSessionLookup openOrGetForOperator(long storeId, long tableId,
            String customerName, String customerPhone) {
        var current = diningTableMapper.findTableSessionByStoreIdAndTableIdForUpdate(storeId,
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
                new CustomerTableSessionResolutionCommand(null, customerName, customerPhone));
        String sessionPublicId = UUID.randomUUID().toString();
        diningTableMapper.insertOpenCustomerTableSession(tableId, sessionPublicId, clientAccountId,
                customerName, customerPhone);
        return new CustomerTableSessionLookup(0L, tableId, storeId, current.tableCode(),
                sessionPublicId, "OPEN");
    }

    private long findOrCreateClientAccount(long storeId,
            CustomerTableSessionResolutionCommand command) {
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
